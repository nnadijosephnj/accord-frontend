import React, { useState, useRef, useEffect } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, Save, Lock, ShieldAlert, Mail } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { apiCall, uploadFileCall } from '../../utils/api';
import { useActiveWallet } from "thirdweb/react";

export default function Settings() {
  const { address, userProfile, setUserProfile, logout } = useWallet();
  const activeWallet = useActiveWallet();
  
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, earned: 0, spent: 0 });
  const fileInputRef = useRef(null);

  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;
  const isGenerated = userProfile?.wallet_type === 'generated';

  useEffect(() => {
    loadStats();
  }, [address]);

  useEffect(() => {
    if (userProfile?.email) setEmail(userProfile.email);
    if (userProfile?.display_name) setDisplayName(userProfile.display_name);
  }, [userProfile]);

  const loadStats = async () => {
    try {
      const agreements = await apiCall('/api/agreements');
      if (agreements) {
        setStats({
          total: agreements.length,
          completed: agreements.filter(a => a.status === 'COMPLETED').length,
          earned: agreements.filter(a => a.status === 'COMPLETED' && a.freelancer_wallet?.toLowerCase() === address?.toLowerCase()).reduce((sum, a) => sum + Number(a.amount || 0), 0),
          spent: agreements.filter(a => a.status === 'COMPLETED' && a.client_wallet?.toLowerCase() === address?.toLowerCase()).reduce((sum, a) => sum + Number(a.amount || 0), 0),
        });
      }
    } catch (e) {
      console.warn("Stats load failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ display_name: displayName, email }),
      });
      setUserProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await uploadFileCall('/api/auth/avatar', formData);
      if (result?.user) setUserProfile(result.user);
    } catch (e) {
      alert('Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Account Settings</h1>
        <p className="text-sm text-zinc-500 font-medium">Manage your decentralized identity and security.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-xl p-8 sm:p-10">
        <div className="flex items-center gap-6 mb-10">
          <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} accept="image/*" className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-zinc-200 dark:border-white/10 shadow-lg cursor-pointer group">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">Change</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-none">{displayName || 'User'}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-2">
              Accord Citizen Since: <span className="text-orange-600 font-black">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Active'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Display Name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500/50 text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Notification Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500/50 text-sm font-bold" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all">
            {saving ? 'Syncing...' : 'Save Profile Changes'}
          </button>
        </form>
      </section>

      {/* Wallet Recovery (Show if generated) */}
      <section className="bg-orange-50 dark:bg-orange-500/5 rounded-[2.5rem] border border-orange-200 dark:border-orange-500/10 p-8 sm:p-10 relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/40">
                <ShieldAlert size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Security & Recovery</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                  {isGenerated 
                    ? "This is an Accord-Managed Wallet. You own the identity and can export your keys to any external wallet (MetaMask/Keplr)." 
                    : "This is a Self-Custody external wallet linked to your Accord identity."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
               {/* 0x Address Display */}
               <div className="p-5 bg-white dark:bg-black/40 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">On-Chain Wallet Address</label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">{address}</p>
               </div>

            {(userProfile?.wallet_type === 'generated' || activeWallet?.id === 'in-app') && (
              <div className="p-8 bg-orange-50 dark:bg-orange-500/5 rounded-[2rem] border border-orange-200 dark:border-orange-500/10">
                <div className="flex items-start gap-5 mb-8">
                  <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/40">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Wallet Recovery</h4>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1">
                      This is an Accord-Managed Wallet. You own the identity and can export your keys to any external wallet (MetaMask/Keplr).
                    </p>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    if (activeWallet) {
                      try {
                        const uri = await activeWallet.export();
                        window.open(uri, "_blank");
                      } catch (e) { alert("Secure export cancelled."); }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 p-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] shadow-xl transition-all"
                >
                  <Lock size={16} /> Reveal Recovery Phrase
                </button>
              </div>
            )}
            </div>
         </div>
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
      </section>

      {/* Disconnect Section */}
      <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
         <div className="text-center sm:text-left">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Session Controls</h3>
            <p className="text-xs text-zinc-400 font-medium">Terminate your current secure connection.</p>
         </div>
         <button onClick={logout} className="px-8 py-4 rounded-2xl border border-red-200 dark:border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-2">
            <AlertTriangle size={16} /> Disconnect Wallet
         </button>
      </section>
    </div>
  );
}
