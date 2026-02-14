
import React, { useState, useMemo } from 'react';
import { BankTransaction } from '../types.ts';
import { PlusIcon } from '../components/Icons.tsx';
import { Modal } from '../components/Modal.tsx';
import { formatCurrency, formatDate } from '../utils/helpers.ts';

interface BankSectionProps {
  transactions: BankTransaction[];
  setTransactions: (t: BankTransaction[]) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'البنك', add: 'إضافة عملية', in: 'الإيداعات', out: 'السحوبات', balance: 'الرصيد', 
    date: 'التاريخ', type: 'النوع', subject: 'البيان', amount: 'المبلغ', actions: 'إجراءات', 
    deposit: 'إيداع', withdrawal: 'سحب', save: 'حفظ العملية', person: 'الطرف المعني'
  },
  fr: {
    title: 'Banque', add: 'Nouvelle Opération', in: 'Dépôts', out: 'Retraits', balance: 'Solde actuel', 
    date: 'Date', type: 'Type', subject: 'Objet', amount: 'Montant', actions: 'Actions', 
    deposit: 'Dépôt', withdrawal: 'Retrait', save: 'Enregistrer', person: 'Concerné'
  }
};

export const BankSection: React.FC<BankSectionProps> = ({ transactions, setTransactions, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BankTransaction>>({});
  const t = trans[lang];

  const stats = useMemo(() => {
    const deposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
    return { deposits, withdrawals, balance: deposits - withdrawals };
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransactions([...transactions, { ...formData, id: Date.now(), amount: Number(formData.amount) } as BankTransaction]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-emerald-900 border-r-8 border-emerald-500 pr-6">{t.title}</h2>
        <button onClick={() => { setFormData({type: 'deposit', date: new Date().toISOString().slice(0, 10)}); setIsModalOpen(true); }} className="bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl flex items-center gap-3 transition-all">
          <PlusIcon /> {t.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">{t.in}</p>
          <p className="text-3xl font-black text-emerald-600">{formatCurrency(stats.deposits)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border">
          <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-3">{t.out}</p>
          <p className="text-3xl font-black text-rose-400">{formatCurrency(stats.withdrawals)}</p>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">{t.balance}</p>
          <p className="text-3xl font-black text-emerald-900">{formatCurrency(stats.balance)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border overflow-hidden">
        <table className="w-full text-right ltr:text-left">
          <thead className="bg-emerald-50 text-emerald-700 font-black text-xs uppercase border-b">
            <tr>
              <th className="px-10 py-6">{t.date}</th>
              <th className="px-10 py-6">{t.type}</th>
              <th className="px-10 py-6">{t.subject}</th>
              <th className="px-10 py-6 text-center">{t.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-emerald-50/30">
                <td className="px-10 py-5 font-mono text-emerald-500">{formatDate(tx.date)}</td>
                <td className="px-10 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                    {tx.type === 'deposit' ? t.deposit : t.withdrawal}
                  </span>
                </td>
                <td className="px-10 py-5 font-bold text-emerald-900">{tx.subject}</td>
                <td className="px-10 py-5 text-center font-black font-mono">{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.add}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full border p-3 rounded-xl font-bold">
              <option value="deposit">{t.deposit}</option>
              <option value="withdrawal">{t.withdrawal}</option>
           </select>
           <input type="number" placeholder={t.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-3 rounded-xl font-mono" required />
           <input type="text" placeholder={t.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border p-3 rounded-xl" required />
           <button type="submit" className="w-full bg-emerald-500 text-white p-4 rounded-xl font-black">{t.save}</button>
        </form>
      </Modal>
    </div>
  );
};
