
import React, { useState } from 'react';
import { JanitorApartment, JanitorPayment } from '../types.ts';
import { PlusIcon } from '../components/Icons.tsx';
import { Modal } from '../components/Modal.tsx';
import { formatCurrency, formatMonth } from '../utils/helpers.ts';

interface JanitorSectionProps {
  apartments: JanitorApartment[];
  setApartments: (a: JanitorApartment[]) => void;
  payments: JanitorPayment[];
  setPayments: (p: JanitorPayment[]) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'كراء شقق البوابين', add: 'إضافة شقة', rent: 'السومة', tenant: 'المكتري', 
    lastPayments: 'آخر 3 دفعات', pay: 'تسجيل أداء', save: 'حفظ البيانات', 
    bld: 'العمارة', apt: 'الشقة', month: 'شهر الكراء', amount: 'المبلغ المؤدى', 
    confirmPay: 'تأكيد الدفع'
  },
  fr: {
    title: 'Locations Concierges', add: 'Ajouter Appt.', rent: 'Loyer', tenant: 'Locataire', 
    lastPayments: '3 derniers mois', pay: 'Payer', save: 'Enregistrer', 
    bld: 'Immeuble', apt: 'Appt.', month: 'Mois de loyer', amount: 'Montant payé', 
    confirmPay: 'Confirmer'
  }
};

export const JanitorSection: React.FC<JanitorSectionProps> = ({ apartments, setApartments, payments, setPayments, lang }) => {
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const t = trans[lang];

  const handleAddPayment = (aptId: number) => {
    setFormData({ apartmentId: aptId, amountPaid: 0, paymentMonth: new Date().toISOString().slice(0, 7), paymentDate: new Date().toISOString().slice(0, 10) });
    setIsPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayments([...payments, { ...formData, id: Date.now(), amountPaid: Number(formData.amountPaid) }]);
    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 border-r-4 border-sky-500 pr-4">{t.title}</h2>
        <button onClick={() => { setFormData({}); setIsAptModalOpen(true); }} className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          <PlusIcon /> {t.add}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {apartments.map(apt => {
          const aptPayments = payments.filter(p => p.apartmentId === apt.id);
          return (
            <div key={apt.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-slate-800">{t.bld} {apt.buildingNumber} - {t.apt} {apt.apartmentNumber}</h3>
                  <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg font-bold text-sm">{t.rent}: {apt.rentAmount}</span>
                </div>
                <p className="text-slate-500 font-bold mb-4">{t.tenant}: {apt.tenantName}</p>
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.lastPayments}:</p>
                  <div className="divide-y">
                    {aptPayments.slice(-3).reverse().map(p => (
                      <div key={p.id} className="py-2 flex justify-between text-sm font-bold">
                        <span>{formatMonth(p.paymentMonth, lang)}</span>
                        <span className="text-emerald-600">{p.amountPaid}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => handleAddPayment(apt.id)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold">{t.pay}</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isAptModalOpen} onClose={() => setIsAptModalOpen(false)} title={t.add}>
        <form onSubmit={(e) => { e.preventDefault(); setApartments([...apartments, {...formData, id: Date.now(), rentAmount: Number(formData.rentAmount)}]); setIsAptModalOpen(false); }} className="space-y-4">
          <input type="number" placeholder={t.bld} onChange={e => setFormData({...formData, buildingNumber: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <input type="number" placeholder={t.apt} onChange={e => setFormData({...formData, apartmentNumber: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <input type="text" placeholder={t.tenant} onChange={e => setFormData({...formData, tenantName: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <input type="number" placeholder={t.rent} onChange={e => setFormData({...formData, rentAmount: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl">{t.save}</button>
        </form>
      </Modal>

      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={t.pay}>
        <form onSubmit={handleSavePayment} className="space-y-4">
          <input type="month" value={formData.paymentMonth} onChange={e => setFormData({...formData, paymentMonth: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <input type="number" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} className="w-full border p-3 rounded-xl" required />
          <button type="submit" className="w-full bg-sky-500 text-white font-black py-4 rounded-xl">{t.confirmPay}</button>
        </form>
      </Modal>
    </div>
  );
};
