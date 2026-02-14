
import React, { useState, useMemo, useRef } from 'react';
import { Payment, Resident, Shop } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, ExcelIcon, UploadIcon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { formatCurrency, formatMonth, exportToExcel, formatDate } from '../utils/helpers';

declare const XLSX: any;

interface PaymentsSectionProps {
  payments: Payment[];
  setPayments: (p: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  entities: (Resident | Shop)[];
  title: string;
  entityType: 'resident' | 'shop';
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    add: 'إضافة مساهمة', edit: 'تعديل مساهمة', filterBld: 'العمارة', filterMonth: 'شهر المساهمة',
    all: 'الكل', name: 'الاسم الكامل', bld: 'العمارة', unit: 'الشقة/المحل', month: 'الشهر',
    amount: 'المبلغ', date: 'تاريخ الأداء', actions: 'إجراءات', empty: 'لا توجد مساهمات',
    save: 'حفظ المساهمة', import: 'استيراد', export: 'تصدير',
    status: 'الصفة', receipt: 'رقم التوصيل',
    importSuccess: 'تم استيراد المساهمات بنجاح', importError: 'خطأ في الاستيراد. تأكد من تطابق الأسماء.',
    confirmDelete: 'هل أنت متأكد من حذف هذه المساهمة؟'
  },
  fr: {
    add: 'Ajouter', edit: 'Modifier', filterBld: 'Imm.', filterMonth: 'Mois',
    all: 'Tous', name: 'Nom', bld: 'Imm.', unit: 'Appt/Mag', month: 'Mois',
    amount: 'Montant', date: 'Date Paiement', actions: 'Actions', empty: 'Aucun paiement',
    save: 'Enregistrer', import: 'Importer', export: 'Exporter',
    status: 'Statut', receipt: 'N° Reçu',
    importSuccess: 'Paiements importés avec succès', importError: 'Erreur d\'importation',
    confirmDelete: 'Confirmer la suppression de ce paiement ?'
  }
};

export const PaymentsSection: React.FC<PaymentsSectionProps> = ({ payments, setPayments, entities, title, entityType, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [filters] = useState({ building: '', month: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = trans[lang];

  const filteredPayments = useMemo(() => {
    return payments.map(p => ({
      payment: p,
      entity: entities.find(e => String(e.id) === String(p.residentId))
    }))
    .filter(item => {
      if (!item.entity) return false;
      const bMatch = !filters.building || String(item.entity.buildingNumber) === filters.building;
      const mMatch = !filters.month || item.payment.contributionMonth === filters.month;
      return bMatch && mMatch;
    })
    .sort((a, b) => b.payment.id - a.payment.id);
  }, [payments, entities, filters]);

  const handleOpenModal = (payment: Payment | null = null) => {
    setCurrentPayment(payment);
    setFormData(payment || { 
      residentId: undefined, 
      amount: entityType === 'resident' ? 50 : 100, 
      contributionMonth: new Date().toISOString().slice(0, 7),
      paymentDate: new Date().toISOString().slice(0, 10),
      receiptNumber: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, id: currentPayment ? currentPayment.id : Date.now(), amount: Number(formData.amount) } as Payment;
    if (currentPayment) {
      setPayments(prev => prev.map(p => String(p.id) === String(currentPayment.id) ? data : p));
    } else {
      setPayments(prev => [...prev, data]);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const dataToExport = filteredPayments.map(({ payment, entity }) => ({
      [t.name]: (entity as any)?.fullName || (entity as any)?.ownerName,
      [t.status]: (entity as any)?.residentType || '-',
      [t.bld]: entity?.buildingNumber,
      [t.unit]: (entity as any)?.apartmentNumber || (entity as any)?.shopNumber,
      [t.month]: payment.contributionMonth,
      [t.amount]: payment.amount,
      [t.date]: payment.paymentDate,
      [t.receipt]: payment.receiptNumber || '-'
    }));
    exportToExcel(`${title}_${new Date().toLocaleDateString()}`, dataToExport);
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
        
        const newPayments: Payment[] = [];
        data.forEach((row: any, index: number) => {
          const rowName = String(row[t.name] || row['الاسم الكامل'] || row['Nom'] || '').trim();
          const rowMonth = String(row[t.month] || row['الشهر'] || row['Mois'] || '').trim();
          const rowAmount = parseFloat(row[t.amount] || row['المبلغ'] || row['Montant'] || '0');
          const rowReceipt = String(row[t.receipt] || row['رقم التوصيل'] || row['N° Reçu'] || '').trim();
          const rowDate = row[t.date] || row['تاريخ الأداء'] || new Date().toISOString().slice(0, 10);
          
          const entity = entities.find(e => {
            const eName = (e as any).fullName || (e as any).ownerName;
            return eName.trim() === rowName;
          });

          if (entity && rowMonth && rowAmount > 0) {
            newPayments.push({
              id: Date.now() + index,
              residentId: entity.id,
              contributionMonth: rowMonth,
              amount: rowAmount,
              paymentDate: formatDate(rowDate),
              receiptNumber: rowReceipt
            });
          }
        });

        if (newPayments.length > 0) {
          setPayments(prev => [...prev, ...newPayments]);
          alert(`${t.importSuccess} (${newPayments.length})`);
        } else {
          alert(t.importError);
        }
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-3">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleOpenModal()} className="bg-[#0078BD] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm transition-all">
            <PlusIcon /> {t.add}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-white border text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-slate-50 shadow-sm">
            <UploadIcon /> {t.import}
          </button>
          <button onClick={handleExport} className="bg-white border border-[#F9A61A] text-[#F9A61A] px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-orange-50 shadow-sm transition-all">
            <ExcelIcon /> {t.export}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold border-b">
              <tr>
                <th className="px-4 py-4">{t.name}</th>
                <th className="px-4 py-4">{t.bld}</th>
                <th className="px-4 py-4">{t.unit}</th>
                <th className="px-4 py-4">{t.status}</th>
                <th className="px-4 py-4 text-center">{t.month}</th>
                <th className="px-4 py-4 text-center">{t.amount}</th>
                <th className="px-4 py-4 text-center">{t.date}</th>
                <th className="px-4 py-4 text-center">{t.receipt}</th>
                <th className="px-4 py-4 text-center no-print">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map(({ payment, entity }) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-700">{(entity as any)?.fullName || (entity as any)?.ownerName}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{entity?.buildingNumber}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{(entity as any)?.apartmentNumber || (entity as any)?.shopNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${(entity as any)?.residentType === 'مالك' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {(entity as any)?.residentType || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 font-bold whitespace-nowrap">{formatMonth(payment.contributionMonth, lang)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-50 text-[#0078BD] px-2 py-1 rounded font-black font-mono text-sm">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-slate-400 whitespace-nowrap">{payment.paymentDate}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{payment.receiptNumber || '-'}</td>
                  <td className="px-4 py-3 text-center no-print">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(payment)} className="p-2 text-[#0078BD] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(payment.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors">
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-slate-300 italic">{t.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPayment ? t.edit : t.add}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.name}</label>
            <select value={formData.residentId} onChange={e => setFormData({...formData, residentId: Number(e.target.value)})} className="w-full border p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#0078BD]" required>
              <option value="">-- اختر --</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>
                  {(e as any).fullName || (e as any).ownerName} (عمارة {e.buildingNumber} - وحدة {(e as any).apartmentNumber || (e as any).shopNumber})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.month}</label>
              <input type="month" value={formData.contributionMonth || ''} onChange={e => setFormData({...formData, contributionMonth: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.amount}</label>
              <input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.date}</label>
              <input type="date" value={formData.paymentDate || ''} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">{t.receipt}</label>
              <input type="text" placeholder={t.receipt} value={formData.receiptNumber || ''} onChange={e => setFormData({...formData, receiptNumber: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#0078BD]" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#311B92] text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all cursor-pointer">
            {t.save}
          </button>
        </form>
      </Modal>
    </div>
  );
};
