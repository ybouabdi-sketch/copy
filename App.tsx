import React, { useState, useEffect } from 'react';
import { ViewType, Resident, Payment, Shop, Expense, JanitorApartment, JanitorPayment, BankTransaction, Member, AdminSettings } from './types.ts';
import { useIndexedDB } from './hooks/useIndexedDB.ts';
import { Header } from './components/Header.tsx';
import { ResidentsSection } from './sections/ResidentsSection.tsx';
import { PaymentsSection } from './sections/PaymentsSection.tsx';
import { ReportsSection } from './sections/ReportsSection.tsx';
import { ExpensesSection } from './sections/ExpensesSection.tsx';
import { ShopsSection } from './sections/ShopsSection.tsx';
import { BankSection } from './sections/BankSection.tsx';
import { JanitorSection } from './sections/JanitorSection.tsx';
import { AnnualReportSection } from './sections/AnnualReportSection.tsx';
import { MemberManagement } from './sections/MemberManagement.tsx';
import { ProfileSection } from './sections/ProfileSection.tsx';
import { SyndicProLogo } from './components/Icons.tsx';

const translations = {
  ar: {
    footer: 'جميع الحقوق محفوظة',
    sections: {
      residents: 'الساكنة',
      payments: 'المساهمات',
      shops: 'المحلات',
      expenses: 'المصاريف',
      reports: 'التقارير',
      bank: 'البنك',
      janitors: 'البوابين',
      annual: 'التقرير السنوي'
    },
    loading: 'جاري تحميل البيانات...'
  },
  fr: {
    footer: 'Tous droits réservés',
    sections: {
      residents: 'Résidents',
      payments: 'Paiements',
      shops: 'Commerces',
      expenses: 'Dépenses',
      reports: 'Rapports',
      bank: 'Banque',
      janitors: 'Concierges',
      annual: 'Bilan Annuel'
    },
    loading: 'Chargement des données...'
  }
};

const App: React.FC = () => {
  // تم ضبط الحالة لتكون مفعلة مباشرة
  const [isAuthenticated] = useState(true);
  const [isAdmin] = useState(true);
  // Add missing setCurrentMember setter to resolve reference error on line 101
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  
  const [currentView, setCurrentView] = useState<ViewType>('RESIDENTS');
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');

  // استخدام البيانات بشكل مباشر دون عزل لكل مستخدم (Global Access)
  const [members, setMembers] = useIndexedDB<Member>('members_data', []);
  const [adminSettings] = useIndexedDB<AdminSettings>('admin_settings', [{ adminCode: '1974' }]);

  const [residents, setResidents, isResidentsLoading] = useIndexedDB<Resident>('residents_data', []);
  const [payments, setPayments] = useIndexedDB<Payment>('payments_data', []);
  const [shops, setShops] = useIndexedDB<Shop>('shops_data', []);
  const [shopPayments, setShopPayments] = useIndexedDB<Payment>('shop_payments_data', []);
  const [expenses, setExpenses] = useIndexedDB<Expense>('expenses_data', []);
  const [janitorApartments, setJanitorApartments] = useIndexedDB<JanitorApartment>('janitor_apartments_data', []);
  const [janitorPayments, setJanitorPayments] = useIndexedDB<JanitorPayment>('janitor_rental_payments_data', []);
  const [bankTransactions, setBankTransactions] = useIndexedDB<BankTransaction>('bank_transactions_data', []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];

  if (isResidentsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <SyndicProLogo className="w-24 h-24 animate-pulse mb-4" />
        <p className="text-sm font-black text-slate-400 animate-bounce">{t.loading}</p>
      </div>
    );
  }

  const renderContent = () => {
    const commonProps = { lang };
    switch(currentView) {
      case 'RESIDENTS': return <ResidentsSection residents={residents} setResidents={setResidents} {...commonProps} />;
      case 'PAYMENTS': return <PaymentsSection payments={payments} setPayments={setPayments} entities={residents} title={t.sections.payments} entityType="resident" {...commonProps} />;
      case 'SHOPS': return <ShopsSection shops={shops} setShops={setShops} {...commonProps} />;
      case 'SHOP_PAYMENTS': return <PaymentsSection payments={shopPayments} setPayments={setShopPayments} entities={shops} title={t.sections.payments} entityType="shop" {...commonProps} />;
      case 'REPORTS': return <ReportsSection payments={payments} entities={residents} title={t.sections.reports} entityTypeLabel={lang === 'ar' ? "ساكن" : "Résident"} {...commonProps} />;
      case 'SHOP_REPORTS': return <ReportsSection payments={shopPayments} entities={shops} title={t.sections.reports} entityTypeLabel={lang === 'ar' ? "محل" : "Commerce"} {...commonProps} />;
      case 'ANNUAL_REPORTS': return <AnnualReportSection payments={payments} shopPayments={shopPayments} expenses={expenses} janitorPayments={janitorPayments} bankTransactions={bankTransactions} {...commonProps} />;
      case 'EXPENSES': return <ExpensesSection expenses={expenses} setExpenses={setExpenses} {...commonProps} />;
      case 'BANK': return <BankSection transactions={bankTransactions} setTransactions={setBankTransactions} {...commonProps} />;
      case 'JANITOR_RENTALS': return <JanitorSection apartments={janitorApartments} setApartments={setJanitorApartments} payments={janitorPayments} setPayments={setJanitorPayments} {...commonProps} />;
      case 'MEMBER_MANAGEMENT': return <MemberManagement members={members} setMembers={setMembers} adminSettings={adminSettings} setAdminSettings={() => {}} {...commonProps} />;
      case 'PROFILE': return currentMember ? <ProfileSection member={currentMember} setMembers={setMembers} setCurrentMember={setCurrentMember} {...commonProps} /> : null;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={() => {}} // تم تعطيل الخروج
        lang={lang} 
        setLang={setLang} 
        isAdmin={true} 
        currentMember={null} 
      />
      <main className="container mx-auto px-4 py-8 flex-grow">{renderContent()}</main>
      <footer className="bg-slate-50 border-t py-10 text-center text-slate-400 no-print">
        <p className="text-xs font-black tracking-widest uppercase">© {new Date().getFullYear()} <span style={{color: '#0078BD'}}>Syndic</span><span style={{color: '#F9A61A'}}>Pro</span> - {t.footer}</p>
      </footer>
    </div>
  );
};

export default App;