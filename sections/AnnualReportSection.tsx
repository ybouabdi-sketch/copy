
import React, { useMemo } from 'react';
import { Payment, Expense, JanitorPayment, BankTransaction } from '../types.ts';
import { formatCurrency } from '../utils/helpers.ts';

interface AnnualReportProps {
  payments: Payment[];
  shopPayments: Payment[];
  expenses: Expense[];
  janitorPayments: JanitorPayment[];
  bankTransactions: BankTransaction[];
  lang: 'ar' | 'fr';
}

const trans = {
  ar: { title: 'التقرير المالي', income: 'المداخيل', expense: 'المصاريف', balance: 'الفائض المالي', bank: 'رصيد البنك', res: 'الساكنة', shop: 'المحلات', jan: 'البوابين' },
  fr: { title: 'Bilan Financier', income: 'Revenus', expense: 'Dépenses', balance: 'Résultat', bank: 'Solde Banque', res: 'Résidents', shop: 'Commerces', jan: 'Concierges' }
};

export const AnnualReportSection: React.FC<AnnualReportProps> = ({ payments, shopPayments, expenses, janitorPayments, bankTransactions, lang }) => {
  const t = trans[lang];
  const stats = useMemo(() => {
    const resIncome = payments.reduce((s, p) => s + p.amount, 0);
    const shopIncome = shopPayments.reduce((s, p) => s + p.amount, 0);
    const janitorIncome = (janitorPayments || []).reduce((s, p) => s + p.amountPaid, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const bankDeposits = bankTransactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
    const bankWithdrawals = bankTransactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

    return {
      totalIncome: resIncome + shopIncome + janitorIncome,
      resIncome, shopIncome, janitorIncome,
      totalExpenses,
      netResult: (resIncome + shopIncome + janitorIncome) - totalExpenses,
      bankBalance: bankDeposits - bankWithdrawals
    };
  }, [payments, shopPayments, expenses, janitorPayments, bankTransactions]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-4">{t.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div style={{backgroundColor: '#311B92'}} className="p-6 rounded-2xl text-white shadow-xl">
          <p className="text-[10px] font-bold text-[#F9A61A] uppercase tracking-widest mb-1">{t.income}</p>
          <p className="text-2xl font-black">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="bg-rose-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{t.expense}</p>
          <p className="text-2xl font-black">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.balance}</p>
          <p className={`text-2xl font-black ${stats.netResult >= 0 ? 'text-[#0078BD]' : 'text-rose-600'}`}>{formatCurrency(stats.netResult)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.bank}</p>
          <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.bankBalance)}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        {[
          { label: t.res, val: stats.resIncome, color: 'bg-[#0078BD]' },
          { label: t.shop, val: stats.shopIncome, color: 'bg-[#F9A61A]' },
          { label: t.jan, val: stats.janitorIncome, color: 'bg-[#311B92]' }
        ].map(item => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500">
              <span>{item.label}</span>
              <span className="font-mono">{formatCurrency(item.val)}</span>
            </div>
            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
              <div className={`${item.color} h-full transition-all duration-1000 shadow-inner`} style={{ width: `${(item.val / Math.max(1, stats.totalIncome)) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
