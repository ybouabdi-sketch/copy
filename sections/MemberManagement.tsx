
import React, { useState } from 'react';
import { Member, AdminSettings } from '../types.ts';
import { UserCircleIcon, PlusIcon, DeleteIcon, EditIcon } from '../components/Icons.tsx';
import { Modal } from '../components/Modal.tsx';
import { formatDate } from '../utils/helpers.ts';

interface MemberManagementProps {
  members: Member[];
  setMembers: (m: Member[] | ((prev: Member[]) => Member[])) => void;
  adminSettings: AdminSettings[];
  setAdminSettings: (s: AdminSettings[]) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'إدارة المنخرطين', requests: 'الطلبات المعلقة', approved: 'الأعضاء المفعلون', 
    settings: 'الإعدادات', empty: 'لا توجد بيانات',
    addMember: 'إضافة منخرط',
    firstName: 'الاسم الشخصي',
    lastName: 'الاسم العائلي',
    email: 'البريد الإلكتروني',
    password: 'القن السري',
    save: 'حفظ البيانات',
    approve: 'موافقة وتفعيل',
    deactivate: 'إيقاف التفعيل',
    delete: 'حذف',
    activationCode: 'قن التفعيل',
    activity: 'سجل النشاط',
    lastSeen: 'آخر ظهور',
    joined: 'تاريخ الانضمام',
    activeNow: 'نشط حالياً',
    recentActions: 'النشاطات الأخيرة',
    viewDetails: 'عرض التفاصيل والنشاط',
    subStart: 'تاريخ بداية الاشتراك',
    renewalDate: 'تاريخ التجديد السنوي',
    editDates: 'تعديل تواريخ الاشتراك'
  },
  fr: {
    title: 'Gestion Membres', requests: 'Demandes en attente', approved: 'Membres activés', 
    settings: 'Paramètres', empty: 'Aucune donnée',
    addMember: 'Ajouter un membre',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    password: 'Code Secret',
    save: 'Enregistrer',
    approve: 'Approuver',
    deactivate: 'Désactiver',
    delete: 'Supprimer',
    activationCode: 'Code d\'accès',
    activity: 'Historique d\'activité',
    lastSeen: 'Dernière connexion',
    joined: 'Membre depuis',
    activeNow: 'En ligne',
    recentActions: 'Actions récentes',
    viewDetails: 'Détails & Activité',
    subStart: 'Début d\'abonnement',
    renewalDate: 'Date de renouvellement',
    editDates: 'Modifier les dates'
  }
};

export const MemberManagement: React.FC<MemberManagementProps> = ({ members, setMembers, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    subscriptionStartDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
  });

  const t = trans[lang];
  const pending = (members || []).filter(m => m.status === 'pending');
  const active = (members || []).filter(m => m.status === 'approved');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: Date.now(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      password: formData.password || '',
      subscriptionStartDate: formData.subscriptionStartDate,
      renewalDate: formData.renewalDate,
      status: 'approved',
      requestDate: new Date().toISOString()
    };
    setMembers(prev => [...prev, newMember]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      firstName: '', lastName: '', email: '', password: '',
      subscriptionStartDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
    });
  };

  const handleApprove = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      subscriptionStartDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
    });
    setIsDatesModalOpen(true);
  };

  const saveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setMembers(prev => prev.map(m => m.id === selectedMember.id ? { 
      ...m, 
      status: 'approved',
      subscriptionStartDate: formData.subscriptionStartDate,
      renewalDate: formData.renewalDate
    } : m));
    setIsDatesModalOpen(false);
    setSelectedMember(null);
  };

  const handleDeactivate = (id: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'pending' } : m));
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Confirmer la suppression ?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const openActivity = (member: Member) => {
    setSelectedMember(member);
    setIsActivityModalOpen(true);
  };

  const getMockActivity = (member: Member) => {
    const actionsAr = ["تسجيل الدخول", "عرض التقارير المالية", "تصفح قائمة الساكنة", "تحديث الملف الشخصي"];
    const actionsFr = ["Connexion", "Consultation des rapports", "Liste des résidents", "Mise à jour profil"];
    const acts = lang === 'ar' ? actionsAr : actionsFr;
    
    return [
      { action: member.lastAction || acts[0], date: member.lastLogin || member.requestDate },
      { action: acts[1], date: new Date(new Date(member.requestDate).getTime() + 100000).toISOString() },
      { action: acts[2], date: member.requestDate }
    ];
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-3">{t.title}</h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#0078BD] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer text-sm"
        >
          <PlusIcon /> {t.addMember}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* طلبات الانضمام */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-orange-500 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            {t.requests}
          </h3>
          <div className="space-y-3">
            {pending.map(m => (
              <div key={m.id} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                  <p className="text-[10px] font-mono text-slate-400">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApprove(m)}
                    className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    {t.approve}
                  </button>
                  <button 
                    onClick={(e) => handleDelete(m.id, e)}
                    className="p-2 text-rose-200 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-slate-300 italic text-sm text-center py-10 font-bold">{t.empty}</p>}
          </div>
        </div>

        {/* الأعضاء المفعلون */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-[#0078BD] mb-6">{t.approved}</h3>
          <div className="space-y-3">
            {active.map(m => {
              const isRecentlyActive = m.lastLogin && (Date.now() - new Date(m.lastLogin).getTime() < 300000);
              return (
                <div 
                  key={m.id} 
                  onClick={() => openActivity(m)}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-md hover:border-[#0078BD]/30 transition-all group cursor-pointer"
                  title={t.viewDetails}
                >
                  <div className="flex items-center gap-4">
                     <div className="relative">
                       <div className="w-12 h-12 rounded-full bg-[#0078BD]/10 flex items-center justify-center text-[#0078BD] shrink-0 overflow-hidden border border-slate-200">
                        {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt="" /> : <UserCircleIcon className="w-7 h-7" />}
                       </div>
                       {isRecentlyActive && (
                         <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                       )}
                     </div>
                     <div className="space-y-1">
                      <p className="font-bold text-slate-700 leading-none group-hover:text-[#0078BD] transition-colors">{m.firstName} {m.lastName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{m.email}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                          {t.activationCode}: <span className="font-mono tracking-widest">{m.password}</span>
                        </p>
                        <div className="flex gap-2">
                          <p className="text-[8px] font-bold text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded">
                             {t.subStart}: {m.subscriptionStartDate || '-'}
                          </p>
                          <p className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                             {t.renewalDate}: {m.renewalDate || '-'}
                          </p>
                        </div>
                      </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeactivate(m.id); }}
                      className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    >
                      {t.deactivate}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(m.id, e)}
                      className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {active.length === 0 && <p className="text-slate-300 italic text-sm text-center py-10 font-bold">{t.empty}</p>}
          </div>
        </div>
      </div>

      {/* مودال النشاط */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title={t.activity}>
        {selectedMember && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {selectedMember.avatar ? <img src={selectedMember.avatar} className="w-full h-full object-cover" alt="" /> : <UserCircleIcon className="w-10 h-10 text-slate-300" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800">{selectedMember.firstName} {selectedMember.lastName}</h4>
                <p className="text-xs font-mono text-slate-400">{selectedMember.email}</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">{t.joined}</p>
                    <p className="text-[10px] font-bold text-slate-600">{formatDate(selectedMember.requestDate)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">{t.lastSeen}</p>
                    <p className="text-[10px] font-bold text-[#0078BD]">{selectedMember.lastLogin ? formatDate(selectedMember.lastLogin) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#F9A61A] rounded-full"></span>
                {t.recentActions}
              </h5>
              <div className="space-y-0 relative border-r-2 border-slate-100 mr-4 pr-6 ltr:border-r-0 ltr:border-l-2 ltr:ml-4 ltr:pl-6">
                {getMockActivity(selectedMember).map((act, idx) => (
                  <div key={idx} className="relative pb-6 last:pb-0">
                    <div className="absolute -right-[31px] ltr:-left-[31px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0078BD]"></div>
                    <p className="text-xs font-black text-slate-700 leading-none mb-1">{act.action}</p>
                    <p className="text-[10px] font-mono text-slate-400">{new Date(act.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* مودال تحديد التواريخ عند التفعيل */}
      <Modal isOpen={isDatesModalOpen} onClose={() => setIsDatesModalOpen(false)} title={t.editDates}>
        <form onSubmit={saveApproval} className="space-y-6">
           <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4 text-center">
             <p className="text-sm font-black text-emerald-800">{selectedMember?.firstName} {selectedMember?.lastName}</p>
             <p className="text-[10px] font-mono text-emerald-600/70">{selectedMember?.email}</p>
           </div>
           
           <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.subStart}</label>
                <input 
                  type="date" 
                  value={formData.subscriptionStartDate} 
                  onChange={e => setFormData({...formData, subscriptionStartDate: e.target.value})}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
                  required
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.renewalDate}</label>
                <input 
                  type="date" 
                  value={formData.renewalDate} 
                  onChange={e => setFormData({...formData, renewalDate: e.target.value})}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold text-emerald-600"
                  required
                />
             </div>
           </div>
           <button 
            type="submit" 
            className="w-full bg-[#0078BD] text-white py-4 rounded-xl font-black shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            {t.save}
          </button>
        </form>
      </Modal>

      {/* مودال إضافة منخرط جديد */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.addMember}>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.firstName}</label>
              <input 
                type="text" 
                required
                placeholder={t.firstName}
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.lastName}</label>
              <input 
                type="text" 
                required
                placeholder={t.lastName}
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.email}</label>
            <input 
              type="email" 
              required
              placeholder={t.email}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.password}</label>
            <input 
              type="password" 
              required
              placeholder={t.password}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#F9A61A] outline-none font-black tracking-widest text-center"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.subStart}</label>
              <input 
                type="date" 
                value={formData.subscriptionStartDate} 
                onChange={e => setFormData({...formData, subscriptionStartDate: e.target.value})}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1">{t.renewalDate}</label>
              <input 
                type="date" 
                value={formData.renewalDate} 
                onChange={e => setFormData({...formData, renewalDate: e.target.value})}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold text-emerald-600"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{backgroundColor: '#311B92'}} 
            className="w-full text-white py-4 rounded-xl font-black shadow-lg hover:brightness-110 transition-all cursor-pointer mt-4"
          >
            {t.save}
          </button>
        </form>
      </Modal>
    </div>
  );
};
