
import React, { useState, useMemo, useRef } from 'react';
import { Resident } from '../types.ts';
import { PlusIcon, EditIcon, DeleteIcon, UploadIcon, ExcelIcon } from '../components/Icons.tsx';
import { Modal } from '../components/Modal.tsx';
import { exportToExcel } from '../utils/helpers.ts';

declare const XLSX: any;

interface ResidentsSectionProps {
  residents: Resident[];
  setResidents: (value: Resident[] | ((prev: Resident[]) => Resident[])) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: { 
    title: 'إدارة الساكنة', add: 'إضافة ساكن', import: 'استيراد', export: 'تصدير', 
    filterBld: 'العمارة', filterApt: 'الشقة', name: 'الاسم الكامل', bld: 'العمارة', 
    apt: 'الشقة', type: 'الصفة', phone: 'رقم الهاتف', actions: 'إجراءات', 
    empty: 'لا يوجد سكان حالياً', save: 'حفظ البيانات', edit: 'تعديل',
    owner: 'مالك', tenant: 'مكتري',
    importSuccess: 'تم استيراد البيانات بنجاح', importError: 'خطأ في قراءة الملف',
    confirmDelete: 'هل أنت متأكد من حذف هذا الساكن؟'
  },
  fr: { 
    title: 'Gestion Résidents', add: 'Ajouter', import: 'Importer', export: 'Exporter', 
    filterBld: 'Imm.', filterApt: 'Appt.', name: 'Nom complet', bld: 'Immeuble', 
    apt: 'Appartement', type: 'Statut', phone: 'Téléphone', actions: 'Actions', 
    empty: 'Aucun résident trouvé', save: 'Enregistrer', edit: 'Modifier',
    owner: 'Propriétaire', tenant: 'Locataire',
    importSuccess: 'Importé avec succès', importError: 'Erreur d\'importation',
    confirmDelete: 'Confirmer la suppression de ce résident ?'
  }
};

export const ResidentsSection: React.FC<ResidentsSectionProps> = ({ residents, setResidents, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<Partial<Resident>>({});
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterApartment, setFilterApartment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = trans[lang];

  const filteredResidents = useMemo(() => {
    return (residents || [])
      .filter(r => {
        const buildingMatch = !filterBuilding || String(r.buildingNumber).includes(filterBuilding);
        const apartmentMatch = !filterApartment || String(r.apartmentNumber).includes(filterApartment);
        return buildingMatch && apartmentMatch;
      });
  }, [residents, filterBuilding, filterApartment]);

  const handleOpenModal = (resident: Resident | null = null) => {
    setCurrentResident(resident);
    setFormData(resident || { fullName: '', buildingNumber: '', apartmentNumber: '', residentType: 'مالك', phoneNumber: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, id: currentResident ? currentResident.id : Date.now() } as Resident;
    if (currentResident) {
      setResidents(prev => prev.map(r => String(r.id) === String(currentResident.id) ? data : r));
    } else {
      setResidents(prev => [...prev, data]);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const dataToExport = filteredResidents.map(r => ({
      [t.name]: r.fullName,
      [t.bld]: r.buildingNumber,
      [t.apt]: r.apartmentNumber,
      [t.phone]: r.phoneNumber || '',
      [t.type]: r.residentType
    }));
    exportToExcel(t.title, dataToExport);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const newResidents: Resident[] = data.map((row: any, index: number) => ({
          id: Date.now() + index,
          fullName: String(row[t.name] || row['الاسم الكامل'] || '').trim(),
          buildingNumber: String(row[t.bld] || row['العمارة'] || '').trim(),
          apartmentNumber: String(row[t.apt] || row['الشقة'] || '').trim(),
          phoneNumber: String(row[t.phone] || row['رقم الهاتف'] || '').trim(),
          residentType: (row[t.type] || row['الصفة'] || 'مالك') as any
        })).filter(r => r.fullName !== '');
        setResidents(prev => [...prev, ...newResidents]);
        alert(t.importSuccess);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-3">{t.title}</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleOpenModal()} className="bg-[#0078BD] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:brightness-110 transition-all">
            <PlusIcon /> {t.add}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-white border text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-slate-50">
            <UploadIcon /> {t.import}
          </button>
          <button onClick={handleExport} className="bg-white border border-[#F9A61A] text-[#F9A61A] px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-orange-50 transition-all">
            <ExcelIcon /> {t.export}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold border-b">
              <tr>
                <th className="px-5 py-4">{t.name}</th>
                <th className="px-5 py-4">{t.bld}</th>
                <th className="px-5 py-4">{t.apt}</th>
                <th className="px-5 py-4">{t.phone}</th>
                <th className="px-5 py-4">{t.type}</th>
                <th className="px-5 py-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResidents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-700">{r.fullName}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{r.buildingNumber}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{r.apartmentNumber}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{r.phoneNumber || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${r.residentType === 'مالك' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {r.residentType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(r)} className="p-2 bg-blue-50 text-[#0078BD] rounded-lg cursor-pointer hover:bg-[#0078BD] hover:text-white transition-all">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg cursor-pointer hover:bg-rose-600 hover:text-white transition-all">
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-300 italic">{t.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentResident ? t.edit : t.add}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.name}</label>
            <input type="text" placeholder={t.name} value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.bld}</label>
              <input type="number" placeholder={t.bld} value={formData.buildingNumber || ''} onChange={e => setFormData({...formData, buildingNumber: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.apt}</label>
              <input type="number" placeholder={t.apt} value={formData.apartmentNumber || ''} onChange={e => setFormData({...formData, apartmentNumber: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.phone}</label>
              <input type="tel" placeholder={t.phone} value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.type}</label>
              <select value={formData.residentType} onChange={e => setFormData({...formData, residentType: e.target.value as any})} className="w-full border p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#0078BD]">
                <option value="مالك">{t.owner}</option>
                <option value="مكتري">{t.tenant}</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#311B92] text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer">
            {t.save}
          </button>
        </form>
      </Modal>
    </div>
  );
};
