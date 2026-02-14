
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
    login: { title: 'دخول النظام', email: 'البريد الإلكتروني', password: 'القن السري', button: 'دخول', register: 'إنشاء حساب جديد (طلب انضمام)', wrong: 'خطأ في البيانات أو الحساب غير مفعل', back: 'رجوع للرئيسية' },
    register: { 
      title: 'طلب انضمام للمنصة', 
      firstName: 'الاسم الشخصي', 
      lastName: 'الاسم العائلي', 
      email: 'البريد الإلكتروني', 
      password: 'اكتب القن السري الخاص بك',
      submit: 'إرسال الطلب للمسؤول', 
      success: 'تم تجهيز طلبك! سيفتح الآن تطبيق البريد لإرساله للمسؤول y.bouabdi@gmail.com.',
      backToLogin: 'لديك حساب بالفعل؟ سجل دخولك'
    },
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
    loading: 'جاري تحميل بياناتك الشخصية...'
  },
  fr: {
    login: { title: 'Connexion', email: 'Email', password: 'Code Secret', button: 'Se connecter', register: 'Nouvelle demande d\'adhésion', wrong: 'Identifiants incorrects ou compte non activé', back: 'Retour' },
    register: { 
      title: 'Demande d\'adhésion', 
      firstName: 'Prénom', 
      lastName: 'Nom', 
      email: 'Email', 
      password: 'Votre code secret',
      submit: 'Envoyer la demande', 
      success: 'Demande prête! Votre application de messagerie va s\'ouvrir.',
      backToLogin: 'Déjà inscrit ? Connectez-vous'
    },
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
    loading: 'Chargement de vos données...'
  }
};

const ADMIN_EMAIL_TARGET = "y.bouabdi@gmail.com";

const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  
  const [currentView, setCurrentView] = useState<ViewType>('RESIDENTS');
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');

  // بيانات النظام العامة
  const [members, setMembers] = useIndexedDB<Member>('members_data', []);
  const [adminSettings] = useIndexedDB<AdminSettings>('admin_settings', [{ adminCode: '1974' }]);

  // بيانات المنخرط المعزولة
  const memberId = currentMember?.id;
  const [residents, setResidents, isResidentsLoading] = useIndexedDB<Resident>('residents_data', [], memberId);
  const [payments, setPayments] = useIndexedDB<Payment>('payments_data', [], memberId);
  const [shops, setShops] = useIndexedDB<Shop>('shops_data', [], memberId);
  const [shopPayments, setShopPayments] = useIndexedDB<Payment>('shop_payments_data', [], memberId);
  const [expenses, setExpenses] = useIndexedDB<Expense>('expenses_data', [], memberId);
  const [janitorApartments, setJanitorApartments] = useIndexedDB<JanitorApartment>('janitor_apartments_data', [], memberId);
  const [janitorPayments, setJanitorPayments] = useIndexedDB<JanitorPayment>('janitor_rental_payments_data', [], memberId);
  const [bankTransactions, setBankTransactions] = useIndexedDB<BankTransaction>('bank_transactions_data', [], memberId);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminCode = adminSettings[0]?.adminCode || '1974';

    if (password === currentAdminCode && (!email || email === ADMIN_EMAIL_TARGET)) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setCurrentView('MEMBER_MANAGEMENT');
      return;
    }

    const memberIndex = members.findIndex(m => m.email.toLowerCase() === email.toLowerCase() && m.password === password && m.status === 'approved');
    if (memberIndex !== -1) {
      const updatedMember = { 
        ...members[memberIndex], 
        lastLogin: new Date().toISOString(),
        lastAction: 'Login'
      };
      
      setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
      
      setIsAuthenticated(true);
      setIsAdmin(false);
      setCurrentMember(updatedMember);
      setCurrentView('RESIDENTS');
    } else {
      alert(translations[lang].login.wrong);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: Member = {
      id: Date.now(),
      firstName: regData.firstName,
      lastName: regData.lastName,
      email: regData.email,
      password: regData.password,
      status: 'pending',
      requestDate: new Date().toISOString()
    };
    setMembers(prev => [...prev, newRequest]);
    alert(translations[lang].register.success);
    setAuthMode('login');
  };

  const t = translations[lang];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <SyndicProLogo className="w-32 h-32 mx-auto mb-6 drop-shadow-xl" />
          <h2 className="text-4xl font-black mb-8 flex justify-center tracking-tighter">
            {lang === 'ar' ? (
              <><span style={{ color: '#F9A61A' }}>Pro</span><span style={{ color: '#0078BD' }}>Syndic</span></>
            ) : (
              <><span style={{ color: '#0078BD' }}>Syndic</span><span style={{ color: '#F9A61A' }}>Pro</span></>
            )}
          </h2>
          
          <div className="flex justify-center gap-2 mb-10">
            <button type="button" onClick={() => setLang('ar')} className={`px-6 py-2 rounded-full text-xs font-black transition-all shadow-sm ${lang === 'ar' ? 'bg-[#0078BD] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>العربية</button>
            <button type="button" onClick={() => setLang('fr')} className={`px-6 py-2 rounded-full text-xs font-black transition-all shadow-sm ${lang === 'fr' ? 'bg-[#0078BD] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>Français</button>
          </div>

          {authMode === 'login' ? (
            <div className="space-y-6">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{t.login.title}</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.login.email} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold outline-none focus:ring-4 focus:ring-[#0078BD]/10 focus:border-[#0078BD] transition-all" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-[#F9A61A]/10 focus:border-[#F9A61A] transition-all" placeholder="••••" required />
                <button type="submit" className="w-full bg-[#0078BD] hover:bg-[#005A9E] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">{t.login.button}</button>
              </form>
              <div className="pt-6 border-t border-slate-50">
                <button type="button" onClick={() => setAuthMode('register')} className="text-xs font-black text-[#F9A61A] hover:underline cursor-pointer tracking-wide">{t.login.register}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-[#311B92] text-sm font-black uppercase tracking-widest mb-4 text-center">{t.register.title}</h3>
              <form onSubmit={handleRegister} className="space-y-4 text-right ltr:text-left">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder={t.register.firstName} value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                  <input type="text" required placeholder={t.register.lastName} value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                </div>
                <input type="email" required placeholder={t.register.email} value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                <input type="password" required placeholder={t.register.password} value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-center tracking-[0.3em] outline-none" />
                <button type="submit" style={{backgroundColor: '#311B92'}} className="w-full text-white py-4 rounded-2xl font-black shadow-xl hover:brightness-110 transition-all cursor-pointer">{t.register.submit}</button>
              </form>
              <div className="pt-6 border-t border-slate-50">
                <button type="button" onClick={() => setAuthMode('login')} className="w-full text-xs font-black text-slate-400 hover:text-[#0078BD] transition-colors cursor-pointer">{t.register.backToLogin}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // شاشة التحميل لمنع رؤية واجهات فارغة أثناء جلب بيانات المنخرط
  if (!isAdmin && isResidentsLoading) {
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
      <Header currentView={currentView} setCurrentView={setCurrentView} onLogout={() => {setIsAuthenticated(false); setIsAdmin(false); setCurrentMember(null);}} lang={lang} setLang={setLang} isAdmin={isAdmin} currentMember={currentMember} />
      <main className="container mx-auto px-4 py-8 flex-grow">{renderContent()}</main>
      <footer className="bg-slate-50 border-t py-10 text-center text-slate-400 no-print">
        <p className="text-xs font-black tracking-widest uppercase">© {new Date().getFullYear()} <span style={{color: '#0078BD'}}>Syndic</span><span style={{color: '#F9A61A'}}>Pro</span> - {t.footer}</p>
      </footer>
    </div>
  );
};

export default App;
