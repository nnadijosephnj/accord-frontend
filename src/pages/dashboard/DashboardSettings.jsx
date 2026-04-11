import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, ShieldAlert, Mail } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseHelpers';

export default function Settings() {
  const { user, isGuest, openAuthModal, logout } = useAuth();
  const { address } = useWallet();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
        setDisplayName(user.display_name || '');
        setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName, bio: bio })
        .eq('id', user.id);
      
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id || 'guest'}`;

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">My Account</h1>
          <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">Universal Identity on Injective</p>
        </div>
        <button onClick={logout} className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full text-[10px] font-black uppercase transition-all">Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 text-center shadow-xl">
                <div className="relative inline-block mb-6">
                    <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-[2.5rem] bg-orange-500/10 border-4 border-white dark:border-zinc-800 shadow-2xl" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic truncate px-4">{user?.display_name || 'Anonymous User'}</h3>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-2">{user?.email || 'Authenticated User'}</p>
            </div>

            {/* Identity Markers */}
            <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-sm">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Verified Email</p>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Mail size={14} className="text-orange-500" />
                        <span className="text-xs font-bold truncate">{user?.email || 'No email linked'}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Wallet</p>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Wallet size={14} className="text-blue-500" />
                        <span className="text-xs font-bold truncate tracking-tight">{address || 'No wallet connected'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-8 space-y-8">
            {/* Wallet Setup CTA (If Guest) */}
            {isGuest && (
                <div className="bg-gradient-to-br from-orange-600 to-orange-400 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <ShieldAlert size={32} />
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Setup Required</h2>
                        </div>
                        <p className="text-sm font-bold text-orange-50 mb-6 leading-relaxed max-w-lg italic">
                            You are signed in as a Guest. To create agreements or receive funds, connect a wallet or generate one securely.
                        </p>
                        <button 
                            onClick={() => openAuthModal('WALLET_PROMPT')}
                            className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Connect Wallet Now
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
                        <input type="text" placeholder="John Doe" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} className="w-full h-14 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Bio</label>
                        <input type="text" placeholder="Freelancer" value={bio} onChange={(e)=>setBio(e.target.value)} className="w-full h-14 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={saving} className="h-14 px-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                    {saved && (
                        <div className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle2 size={18} />
                            <span className="text-xs font-black uppercase tracking-widest italic">Updated!</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
