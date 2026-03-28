import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Copy, Check, LogOut, Edit3, Camera
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { apiCall, uploadFileCall } from '../utils/api';
import { useRef } from 'react';

export default function Profile() {
    const { address, userProfile, fetchProfile, setUserProfile, logout, isLoggedIn, connectWallet } = useWallet();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAvatarPopup, setShowAvatarPopup] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ total: 0, completed: 0, earned: 0, spent: 0 });

    useEffect(() => {
        if (userProfile?.display_name) setDisplayName(userProfile.display_name);
        loadStats();
    }, [userProfile]);

    const loadStats = async () => {
        try {
            const agreements = await apiCall('/api/agreements');
            if (agreements) {
                const total = agreements.length;
                const completed = agreements.filter(a => a.status === 'COMPLETED').length;
                const earned = agreements
                    .filter(a => a.status === 'COMPLETED' && a.freelancer_wallet?.toLowerCase() === address?.toLowerCase())
                    .reduce((sum, a) => sum + Number(a.amount_usdt), 0);
                const spent = agreements
                    .filter(a => a.status === 'COMPLETED' && a.client_wallet?.toLowerCase() === address?.toLowerCase())
                    .reduce((sum, a) => sum + Number(a.amount_usdt), 0);
                setStats({ total, completed, earned, spent });
            }
        } catch (e) {
            console.warn("Stats load failed:", e.message);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (!localStorage.getItem('jwt_token')) {
                await connectWallet();
                if (!localStorage.getItem('jwt_token')) {
                    alert("Signature is required to save changes.");
                    return;
                }
            }
            const updatedUser = await apiCall('/api/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ display_name: displayName })
            });
            if (updatedUser) setUserProfile(updatedUser);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert("Save failed: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingAvatar(true);
            setShowAvatarPopup(false);
            const formData = new FormData();
            formData.append('avatar', file);
            const result = await uploadFileCall('/api/auth/avatar', formData);
            if (result?.user) setUserProfile(result.user);
        } catch (e) {
            alert('Avatar upload failed: ' + e.message);
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;

    return (
        <div className="min-h-screen bg-[#f5f6f7] font-sans pb-16">
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-zinc-200/40 rounded-full blur-[150px] -z-10" />

            {/* Header */}
            <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] py-4 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-base font-black text-zinc-900 uppercase tracking-tight">Profile</h1>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="max-w-xl mx-auto px-6 mt-8">
                {/* Hidden file input for avatar */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    className="hidden"
                />

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-6">
                        <button
                            onClick={() => setShowAvatarPopup(v => !v)}
                            className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden block focus:outline-none relative"
                            disabled={uploadingAvatar}
                        >
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </button>

                        {showAvatarPopup && !uploadingAvatar && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowAvatarPopup(false)} />
                                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-xl border border-zinc-100 py-2 px-1 w-52">
                                    <button
                                        onClick={() => { setShowAvatarPopup(false); fileInputRef.current?.click(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition-all text-left"
                                    >
                                        <Camera className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-bold text-zinc-800">Change Profile Picture</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Name */}
                    <div className="text-center flex items-center gap-2 justify-center">
                        {isEditing ? (
                            <div className="flex flex-col items-center gap-4">
                                <input
                                    className="text-2xl font-black text-zinc-900 text-center glass-input outline-none"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Satoshi"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="orange-glow-btn text-white text-xs font-black uppercase tracking-widest px-8 py-2.5 rounded-full"
                                    >
                                        {saving ? 'Saving...' : 'Save Nickname'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-zinc-100 text-zinc-400 text-xs font-black uppercase tracking-widest px-8 py-2.5 rounded-full hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                                    {userProfile?.display_name || 'Add Nickname'}
                                </h1>
                                <button
                                    onClick={() => { setIsEditing(true); setDisplayName(userProfile?.display_name || ''); }}
                                    className="p-2 bg-zinc-100 rounded-lg text-zinc-400 hover:text-orange-600 transition-all hover:bg-orange-50"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[4px] mt-4">
                        Member Since: <span className="text-zinc-600">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Active Now'}</span>
                    </p>
                </div>

                {/* Wallet */}
                <div className="glass-panel p-6 rounded-[1.75rem] mb-5">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Connected Wallet</p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                            <span className="text-xs font-bold text-zinc-700 truncate font-mono">{address}</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="bg-zinc-100 p-2.5 rounded-xl text-zinc-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                        { label: 'Agreements', value: stats.total, unit: null },
                        { label: 'Completed', value: stats.completed, unit: null, highlight: true },
                        { label: 'Total Earned', value: stats.earned, unit: 'USDT' },
                        { label: 'Total Spent', value: stats.spent, unit: 'USDT' },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel p-5 rounded-[1.5rem]">
                            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-1.5 truncate">{s.label}</p>
                            <h3 className={`text-2xl font-black ${s.highlight ? 'text-orange-600' : 'text-zinc-900'}`}>
                                {s.value}
                                {s.unit && <span className="text-[10px] font-bold text-orange-500 ml-1">{s.unit}</span>}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Disconnect */}
                <button
                    onClick={logout}
                    className="w-full py-5 bg-white/70 backdrop-blur-sm border border-red-100 text-red-500 font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 active:scale-95"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                </button>
            </main>
        </div>
    );
}
