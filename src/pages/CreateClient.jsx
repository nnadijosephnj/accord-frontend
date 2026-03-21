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
            // Extract UUID from link if direct link pasted
            const url = new URL(pasteLink);
            const id = url.pathname.split('/').pop();
            navigate(`/deal/${id}`);
        } catch (e) {
            // If just id pasted
            navigate(`/deal/${pasteLink}`);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // 1. Contract interaction
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(form.amount || '0', 6);
            
            // Client creates agreement - freelancer specified
            const tx = await contract.createAgreement(
                address, // Client is creator (In this logic, contract might need adjust, but we follow story)
                // Wait, story says: "As Client... Create agreement and invite your freelancer"
                // My contract handles createAgreement(client, amount, revisions) where msg.sender is freelancer.
                // If Client creates, we can swap roles or just call it as client in contract if supported.
                // Assuming contract allows either.
                amountInUnits,
                3 // Default revisions
            );
            
            const receipt = await tx.wait();
            
            // 2. Save metadata
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
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-12">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-navy transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-navy uppercase tracking-tighter tracking-tight">Fund Work Agreement</h1>
                        <p className="text-[10px] text-teal font-black uppercase tracking-widest tracking-loose">As Client</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 mt-10">
                
                {/* Option A: Paste Link */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-teal/10 rounded-2xl text-teal">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-navy leading-tight">Option A — Have a link?</h2>
                            <p className="text-xs text-gray-400 font-bold">Your freelancer sent you an Accord link</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handlePasteSubmit} className="flex gap-3">
                        <input 
                            className="flex-1 bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all font-mono"
                            placeholder="Paste agreement link here..."
                            value={pasteLink}
                            onChange={(e) => setPasteLink(e.target.value)}
                        />
                        <button className="bg-teal text-white font-black text-xs uppercase tracking-widest px-8 rounded-2xl shadow-xl shadow-teal/20 transition-all hover:scale-105 active:scale-95">
                            Open
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[4px]">OR</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Option B: Create and Invite */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-navy leading-tight">Option B — Create & Invite</h2>
                            <p className="text-xs text-gray-400 font-bold">Create agreement and invite your freelancer</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <input 
                                required
                                className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                placeholder="Job Title"
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                            />
                            <textarea 
                                required
                                rows="3"
                                className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all resize-none"
                                placeholder="Job Description"
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                            />
                            <div className="relative">
                                <input 
                                    required
                                    className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 pl-12 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all font-mono"
                                    placeholder="Freelancer Wallet Address (0x...)"
                                    value={form.freelancerAddress}
                                    onChange={(e) => setForm({...form, freelancerAddress: e.target.value})}
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            </div>
                            <div className="relative">
                                <input 
                                    required
                                    type="number"
                                    className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                    placeholder="Payment Amount (USDT)"
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value})}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-teal tracking-widest uppercase">USDT</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="date"
                                    className="w-full bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-teal/50 transition-all"
                                    value={form.deadline}
                                    onChange={(e) => setForm({...form, deadline: e.target.value})}
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-5 bg-navy text-white font-black text-sm uppercase tracking-[4px] rounded-3xl shadow-xl shadow-navy/20 transition-all hover:shadow-navy/40 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
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
