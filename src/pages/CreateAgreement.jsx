import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { apiCall } from '../utils/api';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractABI';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle2, 
    Copy, 
    MessageCircle, 
    ShieldCheck, 
    Wallet, 
    DollarSign, 
    Hash, 
    Clock, 
    Loader2
} from 'lucide-react';

export default function CreateAgreement() {
    const { address, signer } = useWallet();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_wallet: '',
        amount_usdt: '',
        max_revisions: '3',
        deadline: ''
    });

    useEffect(() => {
        if (!address) navigate('/');
    }, [address]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signer) return alert("Wallet not ready");

        try {
            setIsSubmitting(true);
            
            // 1. Logic for Smart Contract Call
            // Note: Contract expects amount in 6 decimals for USDT
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(formData.amount_usdt, 6);
            
            console.log("Creating agreement on contract...");
            const tx = await contract.createAgreement(
                formData.client_wallet, 
                amountInUnits, 
                parseInt(formData.max_revisions)
            );
            
            const receipt = await tx.wait();
            
            // Note: In real app, we extract agreementId from events
            // Result log: AgreementCreated(uint256 id, address freelancer, address client, uint256 amount)
            // But we can generate a local ID too if events are slow to parse in v6
            let contract_id = "0";
            if (receipt.logs && receipt.logs.length > 0) {
                // Simplistically getting the last value or parsing log
                // receipt.logs[0].args.id might work if ABI is parsed
                contract_id = receipt.logs[0].topics[1] ? parseInt(receipt.logs[0].topics[1], 16).toString() : "0";
            }

            // 2. Sync with Backend
            const result = await apiCall('/api/agreements', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    contract_agreement_id: contract_id
                })
            });

            setSuccessData(result);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Error: " + (error.reason || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}/deal/${successData.id}`;
        navigator.clipboard.writeText(link);
        alert("Link copied!");
    };

    const shareOnWhatsApp = () => {
        const link = `${window.location.origin}/deal/${successData.id}`;
        const text = encodeURIComponent(`Hi! Here is the Accord agreement for "${formData.title}". Please review and fund it here: ${link}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100"
                >
                    <div className="w-24 h-24 bg-teal rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal/20">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-navy mb-4 italic">Agreement Created!</h1>
                    <p className="text-gray-500 mb-10 text-lg">Your agreement for <span className="text-navy font-bold">"{formData.title}"</span> is now live on the Injective blockchain.</p>
                    
                    <div className="bg-gray-50 p-6 rounded-3xl mb-8 flex items-center justify-between border border-gray-100 italic">
                        <span className="text-sm font-bold text-gray-400 truncate mr-4">
                            {window.location.origin}/deal/{successData.id}
                        </span>
                        <button 
                            onClick={copyToClipboard}
                            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-90"
                        >
                            <Copy className="w-5 h-5 text-navy" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={shareOnWhatsApp}
                            className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            <MessageCircle className="w-5 h-5" /> WhatsApp
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center gap-2 py-4 bg-navy text-white rounded-2xl font-bold hover:bg-opacity-90 transition-all active:scale-95"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <nav className="p-8 max-w-7xl mx-auto flex items-center justify-between">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-navy font-bold hover:text-teal transition-all group italic"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                    BACK TO DASHBOARD
                </button>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-teal" />
                    <span className="text-sm font-bold text-navy italic uppercase tracking-widest">Protected by Accord</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-navy mb-4">Create New Agreement</h1>
                    <p className="text-gray-500 italic">Define your terms and protect your freelance work.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-navy flex items-center gap-2 italic">
                            <Briefcase className="w-5 h-5 text-teal" /> JOB DETAILS
                        </h2>
                        
                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Job Title</label>
                            <input 
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Logo Design for Amara"
                                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all font-medium text-navy"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Description</label>
                            <textarea 
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe the milestones, deliverables, and expectations..."
                                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all font-medium text-navy"
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-xl font-bold text-navy flex items-center gap-2 italic">
                                <DollarSign className="w-5 h-5 text-teal" /> PAYMENT & TERMS
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Amount (USDT)</label>
                                    <div className="relative">
                                        <Hash className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            name="amount_usdt"
                                            type="number"
                                            required
                                            value={formData.amount_usdt}
                                            onChange={handleChange}
                                            placeholder="50"
                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all font-bold text-navy"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Max Revisions</label>
                                    <input 
                                        name="max_revisions"
                                        type="number"
                                        required
                                        value={formData.max_revisions}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all font-bold text-navy"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest leading-relaxed">Client Wallet Address (EVM 0x...)</label>
                                <div className="relative">
                                    <Wallet className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        name="client_wallet"
                                        required
                                        value={formData.client_wallet}
                                        onChange={handleChange}
                                        placeholder="0x..."
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all font-mono text-sm text-navy"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Deadline (Optional)</label>
                                <div className="relative">
                                    <Clock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        name="deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal/20 transition-all text-navy"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-navy text-white rounded-[32px] font-black italic tracking-widest uppercase hover:shadow-2xl hover:shadow-navy/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> CONFIRMING ON BLOCKCHAIN...
                                </>
                            ) : "Secure & Create Agreement"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

