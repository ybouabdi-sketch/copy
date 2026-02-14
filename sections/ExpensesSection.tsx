
import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';

interface ExpensesSectionProps {
  expenses: Expense[];
  setExpenses: (e: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'إدارة النفقات', add: 'إضافة نفقة', filterFrom: 'من تاريخ', filterTo: 'إلى تاريخ', 
    total: 'إجمالي النفقات', count: 'عدد العمليات', date: 'التاريخ', name: 'البيان', 
    amount: 'المبلغ', person: 'المكلف بالصرف', doc: 'المرفق', actions: 'إجراءات', 
    empty: 'لا توجد نفقات', save: 'حفظ النفقة',
    confirmDelete: 'هل أنت متأكد من حذف هذه النفقة؟'
  },
  fr: {
    title: 'Dépenses', add: 'Ajouter', filterFrom: 'Du', filterTo: 'Au', 
    total: 'Total dépenses', count: 'Opérations', date: 'Date', name: 'Libellé', 
    amount: 'Montant', person: 'Responsable', doc: 'Justificatif', actions: 'Actions', 
    empty: 'Aucune dépense', save: 'Enregistrer',
    confirmDelete: 'Confirmer la suppression de cette dépense ?'
  }
};

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ expenses, setExpenses, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({});
  const [filters] = useState({ startDate: '', endDate: '' });
  const t = trans[lang];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(ex => {
      const sMatch = !filters.startDate || ex.date >= filters.startDate;
      const eMatch = !filters.endDate || ex.date <= filters.endDate;
      return sMatch && eMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filters]);

  const totalAmount = filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);

  const handleOpenModal = (expense: Expense | null = null) => {
    setCurrentExpense(expense);
    setFormData(expense || { name: '', amount: 0, date: new Date().toISOString().slice(0, 10), personInCharge: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      setExpenses(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, id: currentExpense ? currentExpense.id : Date.now(), amount: Number(formData.amount) } as Expense;
    if (currentExpense) {
      setExpenses(prev => prev.map(ex => String(ex.id) === String(currentExpense.id) ? data : ex));
    } else {
      setExpenses(prev => [...prev, data]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-3xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-4">{t.title}</h2>
        <button type="button" onClick={() => handleOpenModal()} style={{backgroundColor: '#0078BD'}} className="text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer">
          <PlusIcon /> {t.add}
        </button>
      </div>

      <div style={{backgroundColor: '#311B92'}} className="text-white p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <p className="text-[#F9A61A] text-xs font-black uppercase tracking-[0.2em] mb-1">{t.total}</p>
          <p className="text-4xl font-black font-mono">{formatCurrency(totalAmount)} <span className="text-xl opacity-50">{lang === 'ar' ? 'درهم' : 'DH'}</span></p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <p className="text-[10px] text-white/50 font-bold mb-1 uppercase tracking-widest">{t.count}</p>
          <p className="text-xl font-black">{filteredExpenses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-right ltr:text-left">
          <thead className="bg-slate-50 text-slate-400 font-black text-xs uppercase border-b">
            <tr>
              <th className="px-6 py-5">{t.date}</th>
              <th className="px-6 py-5">{t.name}</th>
              <th className="px-6 py-5">{t.amount}</th>
              <th className="px-6 py-5">{t.person}</th>
              <th className="px-6 py-5 no-print text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredExpenses.map(ex => (
              <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-slate-400">{formatDate(ex.date)}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{ex.name}</td>
                <td className="px-6 py-4 font-black text-rose-500 font-mono italic">{formatCurrency(ex.amount)}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{ex.personInCharge}</td>
                <td className="px-6 py-4 no-print text-center">
                   <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => handleOpenModal(ex)} className="text-[#0078BD] hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer"><EditIcon /></button>
                    <button type="button" onClick={() => handleDelete(ex.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer"><DeleteIcon /></button>
                   </div>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-300 font-bold italic">
                    {t.empty}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.add}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder={t.name} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#F9A61A] outline-none" required />
          <input type="number" placeholder={t.amount} value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#F9A61A] outline-none" required />
          <input type="text" placeholder={t.person} value={formData.personInCharge} onChange={e => setFormData({...formData, personInCharge: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#F9A61A] outline-none" required />
          <button type="submit" style={{backgroundColor: '#311B92'}} className="w-full text-white p-4 rounded-xl font-bold shadow-lg cursor-pointer">
            {t.save}
          </button>
        </form>
      </Modal>
    </div>
  );
};
