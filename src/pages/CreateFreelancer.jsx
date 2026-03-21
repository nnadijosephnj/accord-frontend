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
            
            // 1. Contract interaction
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(form.amount || '0', 6);
            
            const tx = await contract.createAgreement(
                form.clientAddress, 
                amountInUnits, 
                form.maxRevisions
            );
            
            const receipt = await tx.wait();
            
            // Get event data (id)
            const event = receipt.logs.find(log => {
                try { return contract.interface.parseLog(log).name === 'AgreementCreated'; } catch(e){return false;}
            });
            const contractAgreementId = contract.interface.parseLog(event).args.id.toString();

            // 2. Save to Supabase
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{scale:0.8}} animate={{scale:1}} className="w-24 h-24 bg-teal/10 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-teal" />
                </motion.div>
                <h1 className="text-3xl font-black text-navy mb-4 tracking-tight">Agreement Created! 🎉</h1>
                <p className="text-gray-400 font-bold mb-10 max-w-sm">Your work agreement is secured on Injective. Share the link with your client to get paid.</p>
                
                <div className="bg-[#F9FAFB] p-6 rounded-[28px] border border-gray-100 w-full max-w-md mb-8">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Copy & Share Link</p>
                    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-navy truncate flex-1">{shareUrl}</span>
                        <button onClick={handleCopy} className="text-teal hover:text-navy transition-all p-1">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-md">
                    <button onClick={handleWhatsApp} className="w-full py-4 bg-[#25D366] text-white font-black text-xs uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20">
                        <MessageCircle className="w-5 h-5" />
                        Share on WhatsApp
                    </button>
                    <button onClick={() => navigate(`/deal/${successData.id}`)} className="w-full py-4 bg-navy text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-navy/10">
                        Go to Agreement Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-12">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-navy">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-navy uppercase tracking-tighter">Create Work Agreement</h1>
                        <p className="text-[10px] text-teal font-black uppercase tracking-widest">As Freelancer</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Job Title */}
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Job Title</label>
                        <input 
                            required
                            className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                            placeholder="e.g. Logo Design for TechBrand"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    {/* Deliverables */}
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Deliverables Description</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all resize-none"
                            placeholder="Describe exactly what you will deliver..."
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                    </div>

                    {/* Client Wallet */}
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Client Wallet Address</label>
                        <div className="relative">
                            <input 
                                required
                                className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 pl-12 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                placeholder="0x..."
                                value={form.clientAddress}
                                onChange={(e) => setForm({...form, clientAddress: e.target.value})}
                            />
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold italic mt-3 ml-1 uppercase tracking-tighter">Only this address can fund this deal</p>
                    </div>

                    {/* Amount & Revisions */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Payment Amount</label>
                            <div className="relative">
                                <input 
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value})}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-teal text-xs tracking-widest">USDT</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Max Revisions</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(num => (
                                    <button 
                                        key={num}
                                        type="button"
                                        onClick={() => setForm({...form, maxRevisions: num})}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                            form.maxRevisions === num 
                                                ? 'bg-teal text-white shadow-lg shadow-teal/30 scale-105' 
                                                : 'bg-gray-50 text-gray-300 hover:text-navy hover:bg-gray-100'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Deadline (Optional)</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                value={form.deadline}
                                onChange={(e) => setForm({...form, deadline: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-6 bg-teal text-white font-black text-sm uppercase tracking-[4px] rounded-[24px] shadow-2xl shadow-teal/20 transition-all hover:shadow-teal/40 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Executing on Injective...' : 'Create & Share Link'}
                    </button>
                </form>
            </main>
        </div>
    );
}
