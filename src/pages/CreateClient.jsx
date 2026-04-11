import React, { useState } from 'react';
import {
    ArrowLeft, RefreshCw, Link as LinkIcon,
    Briefcase, User, Send, Moon, Sun
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall } from '../utils/api';
import { USDC_ADDRESS } from '../utils/contractABI';

export default function CreateClient() {
    const { address } = useWallet();
    const { isDark, toggle } = useTheme();
    const [loading, setLoading] = useState(false);
    const [pasteLink, setPasteLink] = useState('');
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        freelancerAddress: '',
        amount: '',
        tokenAddress: USDC_ADDRESS,
        deadline: ''
    });

    const handlePasteSubmit = (e) => {
        e.preventDefault();
        try {
            const url = new URL(pasteLink);
            const id = url.pathname.split('/').pop();
            navigate(`/deal/${id}`);
        } catch {
            navigate(`/deal/${pasteLink}`);
        }
    };

    const handleCreateSubmit = async (e) => {
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
                    client_wallet: address.toLowerCase(),
                    freelancer_wallet: form.freelancerAddress.toLowerCase(),
                    amount: form.amount,
                    token_address: form.tokenAddress,
                    max_revisions: 3,
                    deadline: form.deadline,
                    contract_agreement_id: contractAgreementId,
                    status: 'PENDING'
                })
            });

            navigate(`/deal/${agreement.id}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest">As Client</p>
                    </div>
                    <button onClick={toggle} className="p-2 rounded-xl text-zinc-400 dark:text-neutral-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all" aria-label="Toggle theme">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-8">

                {/* Option A: Paste Link */}
                <div className="glass-panel p-7 rounded-[2rem] mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-zinc-900 dark:text-white leading-tight">Option A — Have a link?</h2>
                            <p className="text-xs text-zinc-400 dark:text-neutral-500 font-medium">Your freelancer sent you an Accord link</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasteSubmit} className="flex gap-3">
                        <input
                            className="glass-input flex-1 font-mono"
                            placeholder="Paste agreement link here..."
                            value={pasteLink}
                            onChange={(e) => setPasteLink(e.target.value)}
                        />
                        <button className="orange-glow-btn text-white font-black text-xs uppercase tracking-widest px-6 rounded-2xl">
                            Open
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700/50" />
                    <span className="text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-[4px]">OR</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700/50" />
                </div>

                {/* Option B: Create and Invite */}
                <div className="glass-panel p-7 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-zinc-900 dark:text-white leading-tight">Option B — Create & Invite</h2>
                            <p className="text-xs text-zinc-400 dark:text-neutral-500 font-medium">Create agreement and invite your freelancer</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <input required className="glass-input" placeholder="Job Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                        <textarea required rows="3" className="glass-input resize-none" placeholder="Job Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                        <div className="relative">
                            <input required className="glass-input pl-12 font-mono" placeholder="Freelancer Wallet Address (0x...)" value={form.freelancerAddress} onChange={(e) => setForm({...form, freelancerAddress: e.target.value})} />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-neutral-600" />
                        </div>
                        <div className="relative">
                            <input required type="number" className="glass-input pr-24" placeholder="Payment Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
                            <select 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/5 rounded-xl px-2 py-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400 outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                                value={form.tokenAddress}
                                onChange={(e) => setForm({...form, tokenAddress: e.target.value})}
                            >
                                <option value={USDC_ADDRESS}>USDC</option>
                            </select>
                        </div>
                        <input type="date" className="glass-input" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} />

                        <button
                            disabled={loading}
                            className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem] flex items-center justify-center gap-3"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Create & Send to Freelancer
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

