import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ArrowLeft, Plus, CheckCircle2, Copy,
    Check, Calendar, Wallet, DollarSign, MessageCircle
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractABI';

export default function CreateFreelancer() {
    const { address, signer } = useWallet();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        clientAddress: '',
        amount: '',
        maxRevisions: 3,
        deadline: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(form.amount || '0', 6);

            const tx = await contract.createAgreement(
                form.clientAddress,
                amountInUnits,
                form.maxRevisions
            );

            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try { return contract.interface.parseLog(log).name === 'AgreementCreated'; } catch(e){return false;}
            });
            const contractAgreementId = contract.interface.parseLog(event).args.id.toString();

            const agreement = await apiCall('/api/agreements', {
                method: 'POST',
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    client_wallet: form.clientAddress.toLowerCase(),
                    freelancer_wallet: address.toLowerCase(),
                    amount_usdt: form.amount,
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
            <div className="min-h-screen bg-[#f5f6f7] flex flex-col items-center justify-center p-6 text-center">
                <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px] -z-10" />
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-orange-600" />
                </motion.div>
                <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Agreement Created! 🎉</h1>
                <p className="text-zinc-500 font-medium mb-10 max-w-sm">Your work agreement is secured on Injective. Share the link with your client to get paid.</p>

                <div className="glass-panel p-6 rounded-[2rem] w-full max-w-md mb-6">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Copy & Share Link</p>
                    <div className="flex items-center gap-3 bg-white/60 p-4 rounded-2xl border border-white/40">
                        <span className="text-xs font-bold text-zinc-700 truncate flex-1 font-mono">{shareUrl}</span>
                        <button onClick={handleCopy} className="text-orange-600 hover:text-orange-700 transition-all p-1">
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
                        <h1 className="text-base font-black text-zinc-900 uppercase tracking-tight">Create Work Agreement</h1>
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">As Freelancer</p>
                    </div>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Job Title */}
                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Job Title</label>
                        <input
                            required
                            className="glass-input"
                            placeholder="e.g. Logo Design for TechBrand"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    {/* Deliverables */}
                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Deliverables Description</label>
                        <textarea
                            required
                            rows="4"
                            className="glass-input resize-none"
                            placeholder="Describe exactly what you will deliver..."
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                    </div>

                    {/* Client Wallet */}
                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Client Wallet Address</label>
                        <div className="relative">
                            <input
                                required
                                className="glass-input pl-12 font-mono"
                                placeholder="0x..."
                                value={form.clientAddress}
                                onChange={(e) => setForm({...form, clientAddress: e.target.value})}
                            />
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold italic mt-3 ml-1 uppercase tracking-tighter">Only this address can fund this deal</p>
                    </div>

                    {/* Amount & Revisions */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="glass-panel p-6 rounded-[1.75rem]">
                            <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Payment Amount</label>
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="glass-input pr-16"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value})}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-orange-600 text-xs tracking-widest">USDT</span>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[1.75rem]">
                            <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">Max Revisions</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setForm({...form, maxRevisions: num})}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                            form.maxRevisions === num
                                                ? 'orange-glow-btn text-white scale-105'
                                                : 'bg-white/60 text-zinc-400 hover:text-zinc-700 hover:bg-white/80 border border-white/40'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="glass-panel p-6 rounded-[1.75rem]">
                        <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Deadline (Optional)</label>
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
                        {loading ? 'Executing on Injective...' : 'Create & Share Link'}
                    </button>
                </form>
            </main>
        </div>
    );
}
