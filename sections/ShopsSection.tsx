
import React, { useState, useRef } from 'react';
import { Shop } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, ExcelIcon, UploadIcon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { exportToExcel } from '../utils/helpers';

declare const XLSX: any;

interface ShopsSectionProps {
  shops: Shop[];
  setShops: (value: Shop[] | ((prev: Shop[]) => Shop[])) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'إدارة المحلات التجارية', add: 'إضافة محل', export: 'تصدير', import: 'استيراد', 
    name: 'صاحب المحل', bld: 'العمارة', unit: 'رقم المحل', phone: 'الهاتف', actions: 'إجراءات', 
    empty: 'لا توجد محلات', save: 'حفظ البيانات', edit: 'تعديل',
    importSuccess: 'تم استيراد البيانات بنجاح', importError: 'خطأ في قراءة الملف',
    confirmDelete: 'هل أنت متأكد من حذف هذا المحل؟'
  },
  fr: {
    title: 'Commerces', add: 'Ajouter Boutique', export: 'Exporter', import: 'Importer',
    name: 'Nom du commerce', bld: 'Immeuble', unit: 'N° Boutique', phone: 'Tél', actions: 'Actions', 
    empty: 'Aucune boutique', save: 'Enregistrer', edit: 'Modifier',
    importSuccess: 'Importé avec succès', importError: 'Erreur d\'importation',
    confirmDelete: 'Confirmer la suppression de cette boutique ?'
  }
};

export const ShopsSection: React.FC<ShopsSectionProps> = ({ shops, setShops, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<Partial<Shop>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = trans[lang];

  const handleOpenModal = (shop: Shop | null = null) => {
    setCurrentShop(shop);
    setFormData(shop || { ownerName: '', buildingNumber: '', shopNumber: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      setShops(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, id: currentShop ? currentShop.id : Date.now() } as Shop;
    if (currentShop) {
      setShops(prev => prev.map(s => String(s.id) === String(currentShop.id) ? data : s));
    } else {
      setShops(prev => [...prev, data]);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const dataToExport = shops.map(s => ({
      [t.name]: s.ownerName,
      [t.bld]: s.buildingNumber,
      [t.unit]: s.shopNumber
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
        const newShops: Shop[] = data.map((row: any, index: number) => ({
          id: Date.now() + index,
          ownerName: String(row[t.name] || row['صاحب المحل'] || '').trim(),
          buildingNumber: String(row[t.bld] || row['العمارة'] || '').trim(),
          shopNumber: String(row[t.unit] || row['رقم المحل'] || '').trim()
        })).filter(s => s.ownerName !== '');
        setShops(prev => [...prev, ...newShops]);
        alert(t.importSuccess);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-3xl font-black text-slate-800 border-r-4 border-sky-500 pr-4">{t.title}</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleOpenModal()} className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer">
            <PlusIcon /> {t.add}
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white border text-slate-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-50 transition-all cursor-pointer">
            <UploadIcon /> {t.import}
          </button>
          <button type="button" onClick={handleExport} className="bg-white border border-[#F9A61A] text-[#F9A61A] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-orange-50 transition-all cursor-pointer">
            <ExcelIcon /> {t.export}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right ltr:text-left">
            <thead className="bg-slate-50 text-slate-400 font-black text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-5">{t.name}</th>
                <th className="px-6 py-5">{t.bld}</th>
                <th className="px-6 py-5">{t.unit}</th>
                <th className="px-6 py-5 text-center no-print">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shops.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{s.ownerName}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{s.buildingNumber}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{s.shopNumber}</td>
                  <td className="px-6 py-4 text-center no-print">
                     <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => handleOpenModal(s)} className="text-sky-500 hover:bg-sky-50 p-2 rounded-lg transition-colors cursor-pointer"><EditIcon /></button>
                      <button type="button" onClick={() => handleDelete(s.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer"><DeleteIcon /></button>
                     </div>
                  </td>
                </tr>
              ))}
              {shops.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center text-slate-300 font-bold italic">
                      {t.empty}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentShop ? t.edit : t.add}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder={t.name} value={formData.ownerName || ''} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder={t.bld} value={formData.buildingNumber || ''} onChange={e => setFormData({...formData, buildingNumber: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" required />
            <input type="number" placeholder={t.unit} value={formData.shopNumber || ''} onChange={e => setFormData({...formData, shopNumber: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" required />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-lg cursor-pointer">
            {t.save}
          </button>
        </form>
      </Modal>
    </div>
  );
};
