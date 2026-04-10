import React, { useState, useRef, useEffect } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, Save, Lock, ShieldAlert } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { apiCall, uploadFileCall } from '../../utils/api';
import { useActiveWallet } from "thirdweb/react";
import EmailSettings from '../../components/EmailSettings';

export default function Settings() {
  const { address, userProfile, setUserProfile, logout } = useWallet();
  const activeWallet = useActiveWallet();
  const [tab, setTab] = useState('profile');
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, earned: 0, spent: 0 });
  const fileInputRef = useRef(null);

  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;

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
        const total = agreements.length;
        const completed = agreements.filter(a => a.status === 'COMPLETED').length;
        const earned = agreements
          .filter(a => a.status === 'COMPLETED' && a.freelancer_wallet?.toLowerCase() === address?.toLowerCase())
          .reduce((sum, a) => sum + Number(a.amount || 0), 0);
        const spent = agreements
          .filter(a => a.status === 'COMPLETED' && a.client_wallet?.toLowerCase() === address?.toLowerCase())
          .reduce((sum, a) => sum + Number(a.amount || 0), 0);
        setStats({ total, completed, earned, spent });
      }
    } catch (e) {
      console.warn("Stats load failed:", e.message);
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
      console.error(err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  const tabs = ['Profile', 'Security'];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white uppercase italic tracking-tighter">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-white/5 rounded-2xl p-1 w-fit border border-zinc-200 dark:border-white/5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t.toLowerCase())}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              tab === t.toLowerCase()
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xl'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm p-8">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">Profile Information</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">Update your display name and preferences</p>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} accept="image/*" className="hidden" />
              <div 
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-zinc-200 dark:border-white/10 shadow-lg transition-transform hover:scale-105 cursor-pointer group"
              >
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {!uploadingAvatar && <div className="text-[10px] font-black text-white uppercase tracking-tighter">Edit</div>}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{displayName || 'User'}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                  Joined: <span className="text-orange-600 dark:text-orange-400">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Active'}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Satoshi"
                  className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500/50 text-zinc-900 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@accord.com"
                  className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500/50 text-zinc-900 dark:text-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black text-white bg-orange-600 shadow-xl shadow-orange-600/20 hover:bg-orange-500 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Jobs', value: stats.total },
              { label: 'Done', value: stats.completed },
              { label: 'Earned', value: stats.earned.toFixed(2) },
              { label: 'Spent', value: stats.spent.toFixed(2) },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl border border-zinc-200 dark:border-white/5 text-center shadow-sm">
                <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">{s.value}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <EmailSettings />
          
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm p-8">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-tight">Connected Wallet</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Network</label>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400 italic">Injective EVM Testnet</p>
              </div>

              {userProfile?.wallet_type === 'generated' && (
                <div className="p-8 bg-orange-50 dark:bg-orange-500/5 rounded-[2rem] border border-orange-200 dark:border-orange-500/10">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 shadow-lg shadow-orange-500/10">
                      <ShieldAlert size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Wallet Recovery</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                        You own this wallet. Export your keys to use your funds in Keplr or MetaMask externally.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      if (activeWallet) {
                        try {
                          const uri = await activeWallet.export();
                          window.open(uri, "_blank");
                        } catch (e) {
                          alert("Export cancelled.");
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                  >
                    <Lock size={16} /> Reveal Recovery Phrase
                  </button>

                  <div className="mt-8 flex items-start gap-4 p-5 bg-white dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/5">
                    <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold uppercase tracking-tight">
                      Never share your keys. Anyone with your recovery phrase can steal your USDC.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="mt-8 w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Disconnect
            </button>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm p-8">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-tight">Status</h2>
            <div className="grid gap-3">
              {[
                { label: 'Wallet Active', status: !!address },
                { label: 'Chain Correct', status: true },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between p-4 rounded-2xl ${item.status ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</span>
                  <CheckCircle2 className={`w-4 h-4 ${item.status ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
