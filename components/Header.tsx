
import React from 'react';
import { ViewType, Member } from '../types.ts';
import { LogoutIcon, SyndicProLogo, UserCircleIcon } from './Icons.tsx';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onLogout: () => void;
  lang: 'ar' | 'fr';
  setLang: (l: 'ar' | 'fr') => void;
  isAdmin: boolean;
  currentMember: Member | null;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onLogout, lang, setLang, isAdmin, currentMember }) => {
  const translations = {
    ar: {
      residents: 'الساكنة',
      manageRes: 'إدارة الساكنة',
      payments: 'المساهمات',
      shops: 'المحلات',
      manageShops: 'إدارة المحلات',
      reports: 'تقارير',
      repRes: 'تقرير الساكنة',
      repShops: 'تقرير المحلات',
      repAnnual: 'التقرير السنوي',
      admin: 'الإدارة',
      expenses: 'النفقات',
      janitors: 'البوابين',
      bank: 'البنك',
      members: 'تسيير المنخرطين',
      profile: 'حسابي',
      adminRole: 'المسؤول العام'
    },
    fr: {
      residents: 'Résidents',
      manageRes: 'Gestion',
      payments: 'Paiements',
      shops: 'Boutiques',
      manageShops: 'Gestion',
      reports: 'Rapports',
      repRes: 'Rap. Résidents',
      repShops: 'Rap. Boutiques',
      repAnnual: 'Rap. Annuel',
      admin: 'Admin',
      expenses: 'Dépenses',
      janitors: 'Concierges',
      bank: 'Banque',
      members: 'Gestion Membres',
      profile: 'Profil',
      adminRole: 'Administrateur'
    }
  };

  const t = translations[lang];

  // المسؤول يرى فقط خيار إدارة المنخرطين
  const adminNavGroups = [
    { 
      label: t.admin, 
      items: [
        { id: 'MEMBER_MANAGEMENT', label: t.members }
      ]
    }
  ];

  // المنخرط يرى كل شيء خاص ببياناته
  const memberNavGroups = [
    { 
      label: t.residents, 
      items: [
        { id: 'RESIDENTS', label: t.manageRes },
        { id: 'PAYMENTS', label: t.payments }
      ]
    },
    { 
      label: t.shops, 
      items: [
        { id: 'SHOPS', label: t.manageShops },
        { id: 'SHOP_PAYMENTS', label: t.payments }
      ]
    },
    { 
      label: t.reports, 
      items: [
        { id: 'REPORTS', label: t.repRes },
        { id: 'SHOP_REPORTS', label: t.repShops },
        { id: 'ANNUAL_REPORTS', label: t.repAnnual }
      ]
    },
    { 
      label: t.admin, 
      items: [
        { id: 'EXPENSES', label: t.expenses },
        { id: 'JANITOR_RENTALS', label: t.janitors },
        { id: 'BANK', label: t.bank }
      ]
    },
    {
      label: t.profile,
      items: [
        { id: 'PROFILE', label: t.profile }
      ]
    }
  ];

  const navGroups = isAdmin ? adminNavGroups : memberNavGroups;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 no-print border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4 shrink-0">
            <SyndicProLogo className="w-16 h-16 drop-shadow-md" />
            <div className="hidden sm:block">
              <h1 className="text-3xl font-black leading-none tracking-tighter">
                {lang === 'ar' ? (
                  <><span style={{ color: '#F9A61A' }}>Pro</span><span style={{ color: '#0078BD' }}>Syndic</span></>
                ) : (
                  <><span style={{ color: '#0078BD' }}>Syndic</span><span style={{ color: '#F9A61A' }}>Pro</span></>
                )}
              </h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Ecosystem Management</p>
            </div>
          </div>

          {/* User Profile Info */}
          <button 
            onClick={() => !isAdmin && setCurrentView('PROFILE')}
            className={`flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2 transition-all group ${!isAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
          >
            <div className="relative">
              {isAdmin ? (
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-[#F9A61A] border-2 border-slate-100 shadow-lg">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
              ) : currentMember?.avatar ? (
                <img src={currentMember.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-[#0078BD]/30 shadow-lg group-hover:border-[#0078BD] transition-colors" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#0078BD]/10 flex items-center justify-center text-[#0078BD] border-2 border-slate-50 shadow-lg group-hover:bg-[#0078BD]/20 transition-colors">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-center">
              <p className={`text-xs font-black text-slate-800 leading-none transition-colors ${!isAdmin ? 'group-hover:text-[#0078BD]' : ''}`}>
                {isAdmin ? t.adminRole : `${currentMember?.firstName} ${currentMember?.lastName}`}
              </p>
            </div>
          </button>
          
          {/* Control Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 p-1 rounded-2xl flex border border-slate-100 shadow-inner">
               <button 
                 onClick={() => setLang('ar')} 
                 className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${lang === 'ar' ? 'bg-[#0078BD] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 AR
               </button>
               <button 
                 onClick={() => setLang('fr')} 
                 className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${lang === 'fr' ? 'bg-[#0078BD] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 FR
               </button>
            </div>
            
            <button 
              type="button"
              onClick={onLogout} 
              className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm cursor-pointer group"
              title={lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
            >
              <LogoutIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-3 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide">
          {navGroups.map(group => (
            <div key={group.label} className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shrink-0 items-center shadow-sm">
              <span className={`hidden lg:inline text-[9px] font-black text-slate-300 uppercase px-3 tracking-widest ${lang === 'ar' ? 'border-l' : 'border-r'} border-slate-200`}>
                {group.label}
              </span>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className={`px-6 py-2.5 text-xs font-black rounded-2xl transition-all whitespace-nowrap ${
                    currentView === item.id 
                    ? 'bg-[#0078BD] text-white shadow-lg scale-105' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
};
