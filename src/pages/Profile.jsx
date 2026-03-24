import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, ArrowLeft, Copy, Check, LogOut, Edit3, Camera
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { apiCall, uploadFileCall } from '../utils/api';

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

    // Stats from Supabase
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        earned: 0,
        spent: 0
    });

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
            console.warn("Stats load failed (likely not signed in):", e.message);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Just-in-time check: if No token, trigger signature first
            if (!localStorage.getItem('jwt_token')) {
                await connectWallet();
                // If it still doesn't exist (user cancelled), stop
                if (!localStorage.getItem('jwt_token')) {
                    alert("Signature is required to save changes.");
                    return;
                }
            }

            const updatedUser = await apiCall('/api/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ display_name: displayName })
            });
            
            if (updatedUser) {
                setUserProfile(updatedUser);
            }
            
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
            // Reset so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-400 hover:text-[#0A3D62] transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black text-[#0A3D62] tracking-tight">Profile</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-6 mt-8">
                {/* Hidden file input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    className="hidden"
                />

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        {/* Avatar circle */}
                        <button
                            onClick={() => setShowAvatarPopup(v => !v)}
                            className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden block focus:outline-none"
                            disabled={uploadingAvatar}
                        >
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </button>

                        {/* Popup */}
                        {showAvatarPopup && !uploadingAvatar && (
                            <>
                                {/* Backdrop to close */}
                                <div className="fixed inset-0 z-40" onClick={() => setShowAvatarPopup(false)} />
                                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 px-1 w-52">
                                    <button
                                        onClick={() => { setShowAvatarPopup(false); fileInputRef.current?.click(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                                    >
                                        <Camera className="w-4 h-4 text-[#17B978]" />
                                        <span className="text-sm font-bold text-[#0A3D62]">Change Profile Picture</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="text-center group flex items-center gap-2 justify-center">
                        {isEditing ? (
                            <div className="flex flex-col items-center gap-4">
                                <input 
                                    className="text-2xl font-black text-[#0A3D62] text-center bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-teal/50 shadow-sm transition-all"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Satoshi"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-[#17B978] text-white text-xs font-black uppercase tracking-widest px-8 py-2.5 rounded-full shadow-lg hover:shadow-teal/20 active:scale-95 transition-all"
                                    >
                                        {saving ? 'Saving...' : 'Save Nickname'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest px-8 py-2.5 rounded-full"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-[#0A3D62] tracking-tight">
                                    {userProfile?.display_name || 'Add Nickname'}
                                </h1>
                                <button 
                                    onClick={() => {
                                        setIsEditing(true);
                                        setDisplayName(userProfile?.display_name || '');
                                    }} 
                                    className="p-2 bg-gray-50 rounded-lg text-gray-300 hover:text-teal transition-all hover:bg-white border border-transparent hover:border-gray-100"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[4px] mt-4 flex items-center justify-center gap-2">
                        Member Since: <span className="text-navy">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Active Now'}</span>
                    </p>
                </div>

                {/* Wallet Section */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 mb-8">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Connected Wallet</p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                            <span className="text-xs font-bold text-navy truncate font-mono">{address}</span>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:text-[#17B978] transition-all"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Agreements</p>
                        <h3 className="text-2xl font-black text-navy">{stats.total}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Completed</p>
                        <h3 className="text-2xl font-black text-emerald-500 underline decoration-teal/20 underline-offset-4">{stats.completed}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 whitespace-nowrap overflow-hidden">Total Earned</p>
                        <h3 className="text-2xl font-black text-navy">{stats.earned} <span className="text-[10px] font-bold text-teal">USDT</span></h3>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 whitespace-nowrap overflow-hidden">Total Spent</p>
                        <h3 className="text-2xl font-black text-navy">{stats.spent} <span className="text-[10px] font-bold text-teal">USDT</span></h3>
                    </div>
                </div>

                {/* Disconnect */}
                <button 
                    onClick={logout}
                    className="w-full py-5 bg-white border border-red-50 text-red-500 font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/10 flex items-center justify-center gap-3 active:scale-95"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                </button>
            </main>
        </div>
    );
}

