import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { apiCall, uploadFileCall } from '../utils/api';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI } from '../utils/contractABI';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    ShieldCheck, 
    Wallet, 
    DollarSign, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Upload, 
    Download, 
    MessageSquare, 
    Loader2, 
    User, 
    Lock, 
    Unlock, 
    ExternalLink 
} from 'lucide-react';

const STATUS = ['PENDING', 'FUNDED', 'SUBMITTED', 'REVISION', 'COMPLETED', 'CANCELLED'];

export default function AgreementRoom() {
    const { id } = useParams();
    const { address, signer, connectWallet } = useWallet();
    const [agreement, setAgreement] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [files, setFiles] = useState({ preview: null, final: null });

    useEffect(() => {
        fetchAgreement();
    }, [id]);

    const fetchAgreement = async () => {
        try {
            setIsLoading(true);
            const data = await apiCall(`/api/agreements/${id}`);
            setAgreement(data);
        } catch (error) {
            console.error("Error fetching agreement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFund = async () => {
        if (!signer) return connectWallet();
        try {
            setIsActionLoading(true);
            const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
            const mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInUnits = ethers.parseUnits(agreement.amount_usdt.toString(), 6);

            // 1. Approve USDT if needed
            const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS);
            if (allowance < amountInUnits) {
                const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amountInUnits);
                await approveTx.wait();
            }

            // 2. Deposit Funds
            const depositTx = await mainContract.depositFunds(agreement.contract_agreement_id);
            await depositTx.wait();

            // 3. Update Status in Backend
            const updated = await apiCall(`/api/agreements/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 1 }) // FUNDED
            });
            setAgreement(updated);
        } catch (error) {
            console.error("Funding failed:", error);
            alert("Funding Error: " + (error.reason || error.message));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        if (!files.preview || !files.final) return alert("Upload both files");
        
        try {
            setIsActionLoading(true);
            const formData = new FormData();
            formData.append('preview', files.preview);
            formData.append('final', files.final);
            formData.append('agreementId', id);

            // 1. Upload to IPFS via Backend
            await uploadFileCall(`/api/upload`, formData);

            // 2. Call Submit Work on Contract
            const mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tx = await mainContract.submitWork(agreement.contract_agreement_id);
            await tx.wait();

            // 3. Update Status
            const updated = await apiCall(`/api/agreements/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 2 }) // SUBMITTED
            });
            
            setAgreement(prev => ({ ...prev, ...updated }));
            alert("Work submitted!");
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Submission error: " + error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsActionLoading(true);
            const mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tx = await mainContract.approveWork(agreement.contract_agreement_id);
            await tx.wait();

            const updated = await apiCall(`/api/agreements/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 4 }) // COMPLETED
            });
            setAgreement(updated);
        } catch (error) {
            console.error("Approval failed:", error);
            alert("Error: " + error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-navy">
                <Loader2 className="w-12 h-12 text-teal animate-spin mb-4" />
                <h2 className="text-xl font-bold italic">Opening Agreement Room...</h2>
            </div>
        );
    }

    if (!agreement) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-navy">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold italic">Agreement not found</h2>
                <Link to="/dashboard" className="mt-4 text-teal hover:underline font-bold">Return to Dashboard</Link>
            </div>
        );
    }

    const isFreelancer = address === agreement.freelancer_wallet;
    const isClient = address === agreement.client_wallet;
    const isFunded = agreement.status === 'FUNDED' || agreement.status === 1;
    const isSubmitted = agreement.status === 'SUBMITTED' || agreement.status === 2;
    const isCompleted = agreement.status === 'COMPLETED' || agreement.status === 4;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <nav className="flex items-center justify-between mb-12">
                   <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-navy rounded-lg group-hover:bg-teal transition-all flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                        </div>
                        <span className="text-xl font-black text-navy italic tracking-tight">Accord Room</span>
                    </Link>
                    {address ? (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 italic">CONNECTED WALLET</span>
                            <span className="text-sm font-bold text-navy">{address.slice(0, 6)}...{address.slice(-4)}</span>
                        </div>
                    ) : (
                        <button onClick={connectWallet} className="px-6 py-2 bg-navy text-white rounded-full font-bold shadow-lg hover:shadow-navy/20 active:scale-95 transition-all">
                            Connect Wallet
                        </button>
                    )}
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Agreement Info */}
                    <div className="lg:col-span-2 space-y-10">
                        <motion.section 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <h1 className="text-4xl font-extrabold text-navy italic tracking-tight mb-2 uppercase leading-none">
                                    {agreement.title}
                                </h1>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-gray-400 italic mb-1 uppercase tracking-widest leading-none">Status</span>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest ${isCompleted ? 'bg-green-100 text-green-600' : isFunded ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-400'}`}>
                                        {STATUS[agreement.status] || agreement.status}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-500 text-lg leading-relaxed mb-10 italic">
                                {agreement.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-50">
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Amount</span>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-teal" />
                                        <span className="text-2xl font-black text-navy">{agreement.amount_usdt} <span className="text-sm font-bold text-gray-400">USDT</span></span>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Revisions</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                        <span className="text-xl font-bold text-navy">{agreement.revision_count} / {agreement.max_revisions}</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Deadline</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-300" />
                                        <span className="text-lg font-bold text-navy">{agreement.deadline ? new Date(agreement.deadline).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* File Section */}
                        <AnimatePresence>
                        {isSubmitted || isCompleted ? (
                            <motion.section 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100"
                            >
                                <h2 className="text-2xl font-black text-navy mb-8 italic flex items-center gap-3 uppercase">
                                    <FileText className="w-6 h-6 text-teal" /> Assets & Work
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal shadow-inner">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-navy italic">Watermarked Preview</h4>
                                                <p className="text-xs text-gray-400">Low-res asset for review</p>
                                            </div>
                                        </div>
                                        <a href="#" className="p-3 bg-white hover:bg-navy hover:text-white transition-all rounded-xl border border-gray-200 shadow-sm">
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>

                                    {isCompleted ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-teal/5 border-2 border-teal/20 rounded-3xl flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal/20">
                                                    <Unlock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-navy italic leading-snug">Final High-Res Deliverable</h4>
                                                    <p className="text-xs text-teal/60 font-medium">Unlocked by Escrow Agreement</p>
                                                </div>
                                            </div>
                                            <a href="#" className="p-3 bg-teal text-white hover:bg-navy transition-all rounded-xl shadow-lg active:scale-95">
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </motion.div>
                                    ) : (
                                        <div className="p-6 bg-gray-100 rounded-3xl border border-dashed border-gray-200 flex items-center justify-between grayscale opacity-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                                                    <Lock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-500 italic">Final Delivery (Locked)</h4>
                                                    <p className="text-xs text-gray-400">Unlock by approving work</p>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <Lock className="w-5 h-5 text-gray-300" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-6">
                        <section className="bg-navy text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal blur-[100px] opacity-20 -mr-16 -mt-16"></div>
                            
                            <h3 className="text-lg font-black italic uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-teal fill-teal" /> Action Panel
                            </h3>

                            <div className="space-y-6">
                                {/* Case: Not Connected */}
                                {!address && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-white/60 mb-6 italic leading-relaxed">Please connect your wallet to interact with this deal.</p>
                                        <button onClick={connectWallet} className="w-full py-4 bg-teal text-white rounded-[24px] font-bold active:scale-95 shadow-lg shadow-teal/20 transition-all uppercase text-sm tracking-widest">
                                            Connect Keplr Wallet
                                        </button>
                                    </div>
                                )}

                                {/* Case: Client - Fund */}
                                {isClient && agreement.status === 'PENDING' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-white/60 italic leading-relaxed">Review the terms and fund the escrow to start the project.</p>
                                        <button 
                                            onClick={handleFund} 
                                            disabled={isActionLoading}
                                            className="w-full py-4 bg-teal text-white rounded-[24px] font-bold active:scale-95 shadow-lg shadow-teal/20 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                                        >
                                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fund Agreement (Lock USDT)"}
                                        </button>
                                    </div>
                                )}

                                {/* Case: Freelancer - Submit Work */}
                                {isFreelancer && (isFunded || agreement.status === 'REVISION') && !isSubmitted && (
                                    <form onSubmit={handleSubmitWork} className="space-y-6">
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4">
                                            <p className="text-teal font-medium flex items-center gap-2 animate-pulse text-xs uppercase tracking-widest mb-2 italic">
                                                <Zap className="w-4 h-4 fill-teal" /> Payment Locked!
                                            </p>
                                            <div className="space-y-4 w-full">
                                                <div className="relative group">
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        id="preview-upload" 
                                                        onChange={(e) => setFiles({ ...files, preview: e.target.files[0] })}
                                                    />
                                                    <label htmlFor="preview-upload" className="w-full py-3 bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer group-hover:bg-white/20 transition-all border border-dashed border-white/20">
                                                        {files.preview ? files.preview.name.slice(0, 15) + "..." : <><Upload className="w-3 h-3" /> Watermarked Preview</>}
                                                    </label>
                                                </div>
                                                <div className="relative group">
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        id="final-upload" 
                                                        onChange={(e) => setFiles({ ...files, final: e.target.files[0] })}
                                                    />
                                                    <label htmlFor="final-upload" className="w-full py-3 bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer group-hover:bg-white/20 transition-all border border-dashed border-white/20">
                                                        {files.final ? files.final.name.slice(0, 15) + "..." : <><Upload className="w-3 h-3" /> Final High-Res File</>}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="w-full py-4 bg-teal text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-teal/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deliver Work to Client"}
                                        </button>
                                    </form>
                                )}

                                {/* Case: Client - Review Work */}
                                {isClient && isSubmitted && !isCompleted && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-teal font-black italic animate-pulse flex items-center gap-2 mb-6 uppercase tracking-widest">
                                            <Zap className="w-4 h-4 fill-teal" /> Work Delivered!
                                        </p>
                                        <button 
                                            onClick={handleApprove}
                                            disabled={isActionLoading}
                                            className="w-full py-4 bg-teal text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 shadow-xl shadow-teal/20 transition-all"
                                        >
                                            {isActionLoading ? 'Processing...' : 'Approve & Release Funds'}
                                        </button>
                                        <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                            Request Revision
                                        </button>
                                        <button className="w-full py-4 bg-transparent text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-all">
                                            Cancel Deal
                                        </button>
                                    </div>
                                )}

                                {/* Case: Completed */}
                                {isCompleted && (
                                    <div className="text-center py-6 bg-teal/10 rounded-3xl border border-teal/20 border-dashed">
                                        <CheckCircle2 className="w-12 h-12 text-teal mx-auto mb-4" />
                                        <h4 className="text-lg font-black uppercase tracking-widest italic leading-tight">Deal Success!</h4>
                                        <p className="text-xs text-white/60 mt-2 px-4 leading-relaxed italic">Funds released and assets delivered. Thank you for using Accord.</p>
                                    </div>
                                )}

                                {/* Status fallback for guest or pending freelancer */}
                                {!isActionLoading && address && ((isFreelancer && agreement.status === 'PENDING') || (!isFreelancer && !isClient)) && (
                                    <div className="bg-white/5 p-6 rounded-3xl text-center">
                                       <Loader2 className="w-8 h-8 text-white/20 animate-spin mx-auto mb-4" />
                                       <p className="text-xs text-white/40 italic leading-relaxed">Waiting for {isFreelancer ? 'client to fund' : 'agreement to update'}...</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Parties Card */}
                        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                             <h3 className="text-xs font-black italic uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <User className="w-4 h-4" /> Parties Involved
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-navy font-bold shadow-inner">
                                            F
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 italic mb-0.5">FREELANCER</span>
                                            <span className="text-xs font-bold text-navy truncate w-24">{agreement.freelancer_wallet?.slice(0, 10)}...</span>
                                        </div>
                                    </div>
                                    <a href={`https://testnet.blockscout.injective.network/address/${agreement.freelancer_wallet}`} target="_blank" className="p-2 text-gray-300 hover:text-teal transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-navy font-bold shadow-inner">
                                            C
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 italic mb-0.5 uppercase tracking-wider">Client</span>
                                            <span className="text-xs font-bold text-navy truncate w-24">{agreement.client_wallet?.slice(0, 10)}...</span>
                                        </div>
                                    </div>
                                     <a href={`https://testnet.blockscout.injective.network/address/${agreement.client_wallet}`} target="_blank" className="p-2 text-gray-300 hover:text-teal transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
