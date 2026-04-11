import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Copy,
    Check, Wallet, MessageCircle, Moon, Sun
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall } from '../utils/api';
import { USDC_ADDRESS } from '../utils/contractABI';

export default function CreateFreelancer() {
    const { address } = useWallet();
    const { isDark, toggle } = useTheme();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        clientAddress: '',
        amount: '',
        tokenAddress: USDC_ADDRESS,
        maxRevisions: 3,
        deadline: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!address) {
                throw new Error('Connect a wallet before creating an agreement');
            }
            setLoading(true);

            // In V2, we generate a random bytes32 ID locally. 
            // The client will fund it on-chain in the Agreement Room.
            const contractAgreementId = ethers.hexlify(ethers.randomBytes(32));

            const agreement = await apiCall('/api/agreements', {
                method: 'POST',
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    client_wallet: form.clientAddress.toLowerCase(),
                    freelancer_wallet: address.toLowerCase(),
                    amount: form.amount,
                    token_address: form.tokenAddress,
                    max_revisions: form.maxRevisions,
                    deadline: form.deadline,
                    contract_agreement_id: contractAgreementId,
                    status: 'PENDING'
                })
            });

            setSuccessData(agreement);
        } catch (error) {
            console.error(error);
            alert("Error: " + (error.reason || error.message));
        } finally {
            setLoading(false);
        }
    };

    const shareUrl = `${window.location.origin}/deal/${successData?.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = `Hi, I've created our agreement on Accord for "${form.title}". Please review and fund it here: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] flex flex-col items-center justify-center p-6 text-center">
                <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 dark:bg-orange-500/[0.04] rounded-full blur-[120px] -z-10" />
                <Motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                </Motion.div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Agreement Created! 🎉</h1>
                <p className="text-zinc-500 dark:text-neutral-400 font-medium mb-10 max-w-sm">Your work agreement is secured on Injective. Share the link with your client to get paid.</p>

                <div className="glass-panel p-6 rounded-[2rem] w-full max-w-md mb-6">
                    <p className="text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Copy & Share Link</p>
                    <div className="flex items-center gap-3 bg-white/60 dark:bg-black/30 p-4 rounded-2xl border border-white/40 dark:border-white/5">
                        <span className="text-xs font-bold text-zinc-700 dark:text-neutral-300 truncate flex-1 font-mono">{shareUrl}</span>
                        <button onClick={handleCopy} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-all p-1">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-md">
                    <button onClick={handleWhatsApp} className="w-full py-4 bg-[#25D366] text-white font-black text-xs uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20">
                        <MessageCircle className="w-5 h-5" />
                        Share on WhatsApp
                    </button>
                    <button onClick={() => navigate(`/deal/${successData.id}`)} className="w-full py-4 orange-glow-btn text-white font-black text-xs uppercase tracking-widest rounded-3xl">
                        Go to Agreement Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] font-sans pb-16">
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 dark:bg-orange-500/[0.04] rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-zinc-200/40 dark:bg-orange-500/[0.02] rounded-full blur-[150px] -z-10" />

            {/* Nav */}
            <nav className="bg-white/70 dark:bg-neutral-950/60 backdrop-blur-xl border-b border-white/20 dark:border-orange-500/10 shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] dark:shadow-none py-4 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-zinc-400 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <div className="flex items-center justify-center">
                            <img src="/logo-light.png" alt="Accord" className="h-11 dark:hidden" />
                            <img src="/logo-dark.png" alt="Accord" className="h-11 hidden dark:block" />
                        </div>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest">As Freelancer</p>
                    </div>
                    <button onClick={toggle} className="p-2 rounded-xl text-zinc-400 dark:text-neutral-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all" aria-label="Toggle theme">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Job Title</label>
                        <input
                            required
                            className="glass-input"
                            placeholder="e.g. Logo Design for TechBrand"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Deliverables Description</label>
                        <textarea
                            required
                            rows="4"
                            className="glass-input resize-none"
                            placeholder="Describe exactly what you will deliver..."
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                    </div>

                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Client Wallet Address</label>
                        <div className="relative">
                            <input
                                required
                                className="glass-input pl-12 font-mono"
                                placeholder="0x..."
                                value={form.clientAddress}
                                onChange={(e) => setForm({...form, clientAddress: e.target.value})}
                            />
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-neutral-600" />
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-neutral-600 font-bold italic mt-3 ml-1 uppercase tracking-tighter">Only this address can fund this deal</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="glass-panel p-6 rounded-[1.75rem]">
                            <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Payment Amount</label>
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="glass-input pr-24"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value})}
                                />
                                <select 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/5 rounded-xl px-2 py-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400 outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                                    value={form.tokenAddress}
                                    onChange={(e) => setForm({...form, tokenAddress: e.target.value})}
                                >
                                    <option value={USDC_ADDRESS}>USDC</option>
                                </select>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[1.75rem]">
                            <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-4">Max Revisions</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setForm({...form, maxRevisions: num})}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                            form.maxRevisions === num
                                                ? 'orange-glow-btn text-white scale-105'
                                                : 'bg-white/60 dark:bg-white/5 text-zinc-400 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/5'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-3">Deadline (Optional)</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={form.deadline}
                            onChange={(e) => setForm({...form, deadline: e.target.value})}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem]"
                    >
                        {loading ? 'Creating Secure Link...' : 'Create & Share Link'}
                    </button>
                </form>
            </main>
        </div>
    );
}

