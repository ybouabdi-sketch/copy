
import React, { useState, useEffect } from 'react';
import { Member } from '../types.ts';
import { CameraIcon, EditIcon } from '../components/Icons.tsx';
import { fileToBase64 } from '../utils/helpers.ts';

interface ProfileSectionProps {
  member: Member;
  setMembers: (m: Member[] | ((prev: Member[]) => Member[])) => void;
  setCurrentMember: (m: Member) => void;
  lang: 'ar' | 'fr';
}

const trans = {
  ar: {
    title: 'حسابي الشخصي',
    firstName: 'الاسم',
    lastName: 'النسب',
    email: 'البريد الإلكتروني',
    password: 'القن السري',
    save: 'حفظ التعديلات',
    success: 'تم تحديث البيانات بنجاح',
    changeAvatar: 'تغيير الصورة',
    subDetails: 'تفاصيل الاشتراك',
    subStart: 'تاريخ بداية الاشتراك',
    renewalDate: 'تاريخ التجديد السنوي',
    daysLeft: 'يوماً متبقية'
  },
  fr: {
    title: 'Mon Profil',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    password: 'Code Secret',
    save: 'Enregistrer',
    success: 'Mise à jour réussie',
    changeAvatar: 'Changer photo',
    subDetails: 'Détails de l\'abonnement',
    subStart: 'Début d\'abonnement',
    renewalDate: 'Date de renouvellement',
    daysLeft: 'jours restants'
  }
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({ member, setMembers, setCurrentMember, lang }) => {
  const [formData, setFormData] = useState<Member>({ ...member });
  const t = trans[lang];

  useEffect(() => {
    setFormData({ ...member });
  }, [member]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData({ ...formData, avatar: base64 });
      } catch (err) {
        console.error("Error loading image", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMembers(prev => prev.map(m => m.id === member.id ? formData : m));
    setCurrentMember(formData);
    alert(t.success);
  };

  const calculateDaysLeft = (renewalDate?: string) => {
    if (!renewalDate) return null;
    const diff = new Date(renewalDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft(member.renewalDate);

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 border-r-4 border-[#0078BD] pr-4 mb-10">{t.title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* معلومات الاشتراك (للعرض فقط) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#311B92] to-[#5E35B1] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#F9A61A] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F9A61A] rounded-full"></span>
              {t.subDetails}
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{t.subStart}</p>
                <p className="text-lg font-black font-mono">{member.subscriptionStartDate || '-'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{t.renewalDate}</p>
                <p className="text-2xl font-black font-mono text-[#F9A61A]">{member.renewalDate || '-'}</p>
              </div>

              {daysLeft !== null && (
                <div className="pt-4 border-t border-white/10 mt-4">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">الوضعية</p>
                        <p className="text-xl font-black">{daysLeft} {t.daysLeft}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center text-[10px] font-black">
                        {Math.min(100, Math.max(0, Math.round((daysLeft / 365) * 100)))}%
                      </div>
                   </div>
                </div>
              )}
            </div>
            
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 italic text-slate-400 text-xs text-center font-bold">
            {lang === 'ar' ? 'يتم تحديد تواريخ الاشتراك وتجديده من طرف إدارة المنصة.' : 'Les dates d\'abonnement sont gérées par l\'administrateur.'}
          </div>
        </div>

        {/* تعديل الملف الشخصي */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-[#0078BD]/10 shadow-lg" alt="" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border-4 border-dashed">
                      <CameraIcon className="w-10 h-10" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-[#F9A61A] text-white p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-10">
                    <CameraIcon className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.changeAvatar}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.firstName}</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.lastName}</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#0078BD] outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.email}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 p-4 rounded-2xl font-mono text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.password}</label>
                <input 
                  type="password" 
                  value={formData.password || ''}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#F9A61A] outline-none font-black tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{backgroundColor: '#311B92'}} 
                className="w-full text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-900/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.save}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
