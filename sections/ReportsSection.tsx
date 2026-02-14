
import React, { useState, useMemo } from 'react';
import { Payment, Resident, Shop } from '../types';
import { ExcelIcon } from '../components/Icons';
import { formatCurrency, formatMonth, exportToExcel } from '../utils/helpers';
import { MONTH_NAMES } from '../constants';

interface ReportsSectionProps {
  payments: Payment[];
  entities: (Resident | Shop)[];
  title: string;
  entityTypeLabel: string;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    export: 'تصدير Excel', bld: 'العمارة', apt: 'الشقة', year: 'السنة', month: 'الشهر', status: 'الحالة',
    all: 'الكل', allMonths: 'جميع الشهور', paid: 'المؤدى', unpaid: 'غير مؤدى',
    name: 'الاسم الكامل', unit: 'الوحدة', paymentsCount: 'الدفعات', total: 'المجموع', 
    last: 'آخر دفعة', empty: 'لا توجد بيانات مطابقة للبحث',
    statTotal: 'المبلغ الإجمالي (المؤدى)',
    statPaidCount: 'عدد الدفعات المؤداة',
    statUnpaidCount: 'عدد الدفعات غير المؤداة',
    currency: 'درهم'
  },
  fr: {
    export: 'Excel', bld: 'Imm.', apt: 'Appt.', year: 'Année', month: 'Mois', status: 'Statut',
    all: 'Tous', allMonths: 'Tous les mois', paid: 'Payé', unpaid: 'Non payé',
    name: 'Nom complet', unit: 'Unité', paymentsCount: 'Paiements', total: 'Total', 
    last: 'Dernier', empty: 'Aucune donnée trouvée',
    statTotal: 'Montant Total (Payé)',
    statPaidCount: 'Nombre de paiements',
    statUnpaidCount: 'Nombre de non-payés',
    currency: 'DH'
  }
};

export const ReportsSection: React.FC<ReportsSectionProps> = ({ payments, entities, title, entityTypeLabel, lang }) => {
  const [filters, setFilters] = useState({ 
    building: '', 
    apartment: '', 
    year: new Date().getFullYear().toString(), 
    month: 'all', 
    status: 'all' 
  });
  
  const t = trans[lang];
  const months = MONTH_NAMES[lang];

  const reportData = useMemo(() => {
    return entities
      .filter(e => {
        const bldMatch = !filters.building || String(e.buildingNumber) === filters.building;
        const aptNumber = (e as any).apartmentNumber || (e as any).shopNumber;
        const aptMatch = !filters.apartment || String(aptNumber) === filters.apartment;
        return bldMatch && aptMatch;
      })
      .map(entity => {
        const filteredPayments = payments.filter(p => {
          const isEntityMatch = String(p.residentId) === String(entity.id);
          if (!isEntityMatch) return false;

          const yearMatch = !filters.year || p.contributionMonth.startsWith(filters.year);
          let monthMatch = true;
          if (filters.month !== 'all') {
            const targetMonth = filters.month.padStart(2, '0');
            monthMatch = p.contributionMonth.endsWith(`-${targetMonth}`);
          }
          return yearMatch && monthMatch;
        });

        const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        return { entity, filteredPayments, totalPaid };
      })
      .filter(item => {
        if (filters.status === 'paid') return item.totalPaid > 0;
        if (filters.status === 'unpaid') return item.totalPaid === 0;
        return true;
      })
      .sort((a, b) => {
        const bldA = parseInt(a.entity.buildingNumber) || 0;
        const bldB = parseInt(b.entity.buildingNumber) || 0;
        if (bldA !== bldB) return bldA - bldB;
        
        const aptA = parseInt((a.entity as any).apartmentNumber || (a.entity as any).shopNumber) || 0;
        const aptB = parseInt((b.entity as any).apartmentNumber || (b.entity as any).shopNumber) || 0;
        return aptA - aptB;
      });
  }, [entities, payments, filters]);

  // حساب الإحصائيات الإجمالية بناءً على البيانات المفلترة
  const stats = useMemo(() => {
    const totalAmount = reportData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalPaidEntries = reportData.reduce((sum, item) => sum + item.filteredPayments.length, 0);
    const unpaidEntities = reportData.filter(item => item.totalPaid === 0).length;
    return { totalAmount, totalPaidEntries, unpaidEntities };
  }, [reportData]);

  const handleExport = () => {
    const dataToExport = reportData.map(({ entity, filteredPayments, totalPaid }) => {
      const lastP = filteredPayments.length > 0 ? [...filteredPayments].sort((a, b) => b.id - a.id)[0] : null;
      return {
        [t.name]: (entity as any).fullName || (entity as any).ownerName,
        [t.bld]: entity.buildingNumber,
        [t.unit]: (entity as any).apartmentNumber || (entity as any).shopNumber,
        [t.paymentsCount]: filteredPayments.length,
        [t.total]: totalPaid,
        [t.last]: lastP ? formatMonth(lastP.contributionMonth, lang) : '-'
      };
    });
    exportToExcel(`${title}_Report`, dataToExport);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-3">{title}</h2>
        <button 
          onClick={handleExport} 
          className="bg-[#F9A61A] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer text-sm"
        >
          <ExcelIcon /> {t.export}
        </button>
      </div>

      {/* بطاقات الإحصائيات الجديدة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div style={{backgroundColor: '#311B92'}} className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[#F9A61A] text-[10px] font-black uppercase tracking-widest mb-2">{t.statTotal}</p>
            <p className="text-3xl font-black font-mono">
              {formatCurrency(stats.totalAmount)} <span className="text-sm opacity-60">{t.currency}</span>
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-[#0078BD] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{t.statPaidCount}</p>
            <p className="text-4xl font-black font-mono">{stats.totalPaidEntries}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.statUnpaidCount}</p>
            <p className="text-4xl font-black font-mono text-rose-500">{stats.unpaidEntities}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-slate-50 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.bld}</label>
            <input 
              type="number" 
              placeholder={t.all} 
              value={filters.building} 
              onChange={e => setFilters({...filters, building: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0078BD]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.apt}</label>
            <input 
              type="number" 
              placeholder={t.all} 
              value={filters.apartment} 
              onChange={e => setFilters({...filters, apartment: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0078BD]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.year}</label>
            <input 
              type="number" 
              placeholder={t.all} 
              value={filters.year} 
              onChange={e => setFilters({...filters, year: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-mono focus:ring-2 focus:ring-[#0078BD]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.month}</label>
            <select 
              value={filters.month} 
              onChange={e => setFilters({...filters, month: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0078BD] appearance-none"
            >
              <option value="all">{t.allMonths}</option>
              {months.map((m, idx) => (
                <option key={idx} value={String(idx + 1)}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.status}</label>
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0078BD] appearance-none"
            >
              <option value="all">{t.all}</option>
              <option value="paid">{t.paid}</option>
              <option value="unpaid">{t.unpaid}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden printable-area">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-5">{t.name}</th>
                <th className="px-6 py-5">{t.bld}</th>
                <th className="px-6 py-5">{t.unit}</th>
                <th className="px-6 py-5 text-center">{t.paymentsCount}</th>
                <th className="px-6 py-5 text-center">{t.total}</th>
                <th className="px-6 py-5 text-center">{t.last}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.map(({ entity, filteredPayments, totalPaid }) => {
                const lastP = filteredPayments.length > 0 ? [...filteredPayments].sort((a, b) => b.id - a.id)[0] : null;
                return (
                  <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {(entity as any).fullName || (entity as any).ownerName}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">{entity.buildingNumber}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">
                      {(entity as any).apartmentNumber || (entity as any).shopNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600">
                        {filteredPayments.length}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center font-black font-mono ${totalPaid > 0 ? 'text-[#0078BD]' : 'text-rose-500'}`}>
                      {formatCurrency(totalPaid)}
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-400">
                      {lastP ? formatMonth(lastP.contributionMonth, lang) : '-'}
                    </td>
                  </tr>
                );
              })}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-300 italic font-bold">
                    {t.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
