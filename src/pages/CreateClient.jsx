import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ArrowLeft, RefreshCw, Link as LinkIcon,
    Briefcase, User, DollarSign, Calendar, Send
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractABI';

export default function CreateClient() {
    const { address, signer } = useWallet();
    const [loading, setLoading] = useState(false);
    const [pasteLink, setPasteLink] = useState('');
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        freelancerAddress: '',
        amount: '',
        deadline: ''
    });

    const handlePasteSubmit = (e) => {
        e.preventDefault();
        try {
            const url = new URL(pasteLink);
            const id = url.pathname.split('/').pop();
            navigate(`/deal/${id}`);
        } catch (e) {
            navigate(`/deal/${pasteLink}`);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(form.amount || '0', 6);

            const tx = await contract.createAgreement(
                address,
                amountInUnits,
                3
            );

            const receipt = await tx.wait();

            const agreement = await apiCall('/api/agreements', {
                method: 'POST',
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    client_wallet: address.toLowerCase(),
                    freelancer_wallet: form.freelancerAddress.toLowerCase(),
                    amount_usdt: form.amount,
                    max_revisions: 3,
                    deadline: form.deadline,
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
        <div className="min-h-screen bg-[#f5f6f7] font-sans pb-16">
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-zinc-200/40 rounded-full blur-[150px] -z-10" />

            {/* Nav */}
            <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] py-4 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-base font-black text-zinc-900 uppercase tracking-tight">Fund Work Agreement</h1>
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">As Client</p>
                    </div>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-8">

                {/* Option A: Paste Link */}
                <div className="glass-panel p-7 rounded-[2rem] mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-zinc-900 leading-tight">Option A — Have a link?</h2>
                            <p className="text-xs text-zinc-400 font-medium">Your freelancer sent you an Accord link</p>
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
                    <div className="flex-1 h-px bg-zinc-200" />
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[4px]">OR</span>
                    <div className="flex-1 h-px bg-zinc-200" />
                </div>

                {/* Option B: Create and Invite */}
                <div className="glass-panel p-7 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-zinc-900 leading-tight">Option B — Create & Invite</h2>
                            <p className="text-xs text-zinc-400 font-medium">Create agreement and invite your freelancer</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <input
                            required
                            className="glass-input"
                            placeholder="Job Title"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                        />
                        <textarea
                            required
                            rows="3"
                            className="glass-input resize-none"
                            placeholder="Job Description"
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                        <div className="relative">
                            <input
                                required
                                className="glass-input pl-12 font-mono"
                                placeholder="Freelancer Wallet Address (0x...)"
                                value={form.freelancerAddress}
                                onChange={(e) => setForm({...form, freelancerAddress: e.target.value})}
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                        </div>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                className="glass-input pr-16"
                                placeholder="Payment Amount"
                                value={form.amount}
                                onChange={(e) => setForm({...form, amount: e.target.value})}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-orange-600 tracking-widest uppercase">USDT</span>
                        </div>
                        <div className="relative">
                            <input
                                type="date"
                                className="glass-input"
                                value={form.deadline}
                                onChange={(e) => setForm({...form, deadline: e.target.value})}
                            />
                        </div>

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
