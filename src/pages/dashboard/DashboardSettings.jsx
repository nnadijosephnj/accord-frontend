import React, { useState } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { apiCall, uploadFileCall } from '../../utils/api';
import { useRef, useEffect } from 'react';

export default function Settings() {
  const { address, userProfile, setUserProfile, logout } = useWallet();
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
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = ['Profile', 'Security'];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t.toLowerCase())}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.toLowerCase()
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Profile Information</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">Update your display name and preferences</p>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />
              <div 
                onClick={handleAvatarClick}
                className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-white/10 shadow-sm transition-transform hover:scale-105 cursor-pointer group"
              >
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" style={{ display: uploadingAvatar ? 'block' : 'none' }} />
                  {!uploadingAvatar && <div className="text-[8px] font-black text-white uppercase">Upload</div>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{displayName || 'User'}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Member Since: <span className="text-zinc-600 dark:text-zinc-300 transition-colors uppercase">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Active Now'}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Display Name <span className="text-zinc-300">(optional)</span></label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CryptoFreelancer"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Email <span className="text-zinc-300">(for notifications only)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.25)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* User Stats Mini Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Total Jobs', value: stats.total },
              { label: 'Completed', value: stats.completed },
              { label: 'Earned ($)', value: stats.earned.toFixed(2) },
              { label: 'Spent ($)', value: stats.spent.toFixed(2) },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm text-center">
                <p className="text-lg font-black text-zinc-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 truncate">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="space-y-4">
          {/* Connected Wallet */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Connected Wallet</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Keplr Wallet Address</label>
                <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">{address || '—'}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">This is locked and cannot be changed</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Network</label>
                <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Injective EVM Testnet</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Locked to this network</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>

          {/* Connection Status */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Connection Status</h2>
            <div className="space-y-3">
              {[
                { label: 'Wallet Connected', status: !!address },
                { label: 'Network Correct', status: true },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl ${item.status ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${item.status ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-semibold ${item.status ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
