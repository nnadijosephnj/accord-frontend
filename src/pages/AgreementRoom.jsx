import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ArrowLeft, Clock, DollarSign, CheckCircle2,
    Lock, FileText, Send, MessageSquare, ExternalLink,
    AlertCircle, ChevronRight, Paperclip, Download, Info
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import * as ethers from 'ethers';
import { apiCall, uploadFileCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDC_ADDRESS, TOKEN_ABI } from '../utils/contractABI';

export default function AgreementRoom() {
    const { id } = useParams();
    const { address, signer } = useWallet();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [agreement, setAgreement] = useState(null);
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const agreementAmount = agreement?.amount ?? agreement?.amount_usdt ?? 0;

    useEffect(() => {
        if (id) {
            loadAgreement();
            loadMessages();
        }
    }, [id]);

    const loadAgreement = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/api/agreements/${id}`);
            setAgreement(data);
            if (data.files) setFiles(data.files);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await apiCall(`/api/messages/${id}`);
            setMessages(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message || !agreement) return;

        // Validation for frontend safety (backend handles it strictly)
        const allowedStatuses = ['FUNDED', 'SUBMITTED', 'REVISION', 'COMPLETED'];
        if (!allowedStatuses.includes(agreement.status.toUpperCase())) {
            return;
        }

        try {
            await apiCall('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    agreement_id: id,
                    content: message
                })
            });
            setMessage('');
            loadMessages();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (action) => {
        if (!signer || !agreement) return;
        try {
            setActionLoading(true);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const contractId = agreement.contract_agreement_id;

            if (action === 'FUND') {
                const tokenAddress = agreement.token_address;
                const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
                const amountInUnits = ethers.parseUnits(agreementAmount.toString(), 6);

                // 1. Approve
                const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInUnits);
                await approveTx.wait();

                // 2. Create Agreement on-chain
                const tx = await contract.createAgreement(
                    contractId, 
                    agreement.freelancer_wallet,
                    tokenAddress,
                    amountInUnits,
                    agreement.max_revisions || 3
                );
                await tx.wait();

                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'FUNDED' }) });
            } 
            else if (action === 'SUBMIT') {
                if (!selectedFile) return alert("Select a file first");
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('agreement_id', id);
                formData.append('file_type', 'preview');

                const uploadRes = await uploadFileCall('/api/upload', formData);
                const uploadedFile = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;

                if (!uploadedFile?.ipfs_hash) {
                    throw new Error('Upload succeeded but no IPFS hash was returned');
                }

                const tx = await contract.deliverWork(contractId, uploadedFile.ipfs_hash);
                await tx.wait();
                
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'SUBMITTED' }) });
            } 
            else if (action === 'APPROVE') {
                const tx = await contract.approveWork(contractId, "FINAL_LINK_PLACEHOLDER");
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) });
            } 
            else if (action === 'REVISION') {
                const tx = await contract.requestRevision(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'REVISION' }) });
            } 
            else if (action === 'CANCEL_REQUEST') {
                const tx = await contract.requestCancel(contractId);
                await tx.wait();
            } 
            else if (action === 'REFUND') {
                const tx = await contract.executeRefund(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }) });
            }

            await loadAgreement();
        } catch (error) {
            console.error(error);
            alert("Transaction error: " + (error.reason || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const s = status?.toUpperCase();
        switch(s) {
            case 'PENDING':   return { label: 'Pending Payment',  color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-neutral-300',             step: 1 };
            case 'FUNDED':    return { label: 'Funded / Locked',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',         step: 2 };
            case 'SUBMITTED': return { label: 'Work Submitted',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',             step: 3 };
            case 'REVISION':  return { label: 'Revision Needed',  color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',         step: 3 };
            case 'COMPLETED': return { label: 'Completed',        color: 'bg-emerald-100 text-emerald-700 dark:bg-green-500/10 dark:text-green-400',         step: 5 };
            case 'CANCELLED': return { label: 'Cancelled',        color: 'bg-rose-100 text-rose-600 dark:bg-red-500/10 dark:text-red-400',                   step: 0 };
            default:          return { label: s,                  color: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800/30 dark:text-neutral-500',              step: 1 };
        }
    };

    if (loading || !agreement) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7] dark:bg-[#0e0e0e]">
            <div className="flex flex-col items-center gap-4 text-zinc-400 dark:text-neutral-500">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-600 rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest">Securing Connection...</span>
            </div>
        </div>
    );

    const isFreelancer = address?.toLowerCase() === agreement.freelancer_wallet.toLowerCase();
    const isClient = address?.toLowerCase() === agreement.client_wallet.toLowerCase();
    const isParticipant = isFreelancer || isClient;
    const allowedStatuses = ['FUNDED', 'SUBMITTED', 'REVISION', 'COMPLETED'];
    const canMessage = isParticipant && allowedStatuses.includes(agreement.status?.toUpperCase());
    const statusInfo = getStatusInfo(agreement.status);

    return (
        <div className="min-h-screen bg-[#f5f6f7] dark:bg-[#0a0a0a] font-sans pb-20">
            <nav className="fixed w-full z-50 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 py-5 px-6 sm:px-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard')} className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all border border-transparent hover:border-orange-500/10">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden sm:block overflow-hidden max-w-[300px]">
                        <h1 className="text-lg font-black tracking-tight truncate">{agreement.title}</h1>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-neutral-500 uppercase tracking-widest font-mono">ID: #{agreement.id?.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-sm ml-2">
                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} alt="Me" />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 sm:px-10 pt-32 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden backdrop-blur-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="flex flex-wrap gap-4 mb-10">
                            <div className="px-5 py-2.5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-500/10 flex items-center gap-3">
                                <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-black text-orange-600 dark:text-orange-400">{agreementAmount} {agreement.token_address?.toLowerCase() === USDC_ADDRESS.toLowerCase() ? 'USDC' : 'USDT'}</span>
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 flex items-center gap-3">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-500 dark:text-neutral-400">{agreement.deadline || 'No deadline'}</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-black mb-6 tracking-tight">{agreement.title}</h2>
                        <p className="text-lg text-zinc-600 dark:text-neutral-400 font-medium leading-relaxed mb-10 whitespace-pre-wrap">
                            {agreement.description}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6 pt-8 border-t border-zinc-100 dark:border-white/5">
                            <div className="space-y-4">
                                <p className="text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-[3px]">Freelancer</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xs">DEV</div>
                                    <span className="text-xs font-mono font-bold text-zinc-400">{agreement.freelancer_wallet}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-[3px]">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-600 font-black text-xs">CLT</div>
                                    <span className="text-xs font-mono font-bold text-zinc-400">{agreement.client_wallet}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-10">
                        <div className="flex justify-between items-center mb-5">
                            <p className="text-[10px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-[3px]">Transaction Flow</p>
                            <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase">{statusInfo.step * 20}% Complete</span>
                        </div>
                        <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/40 dark:border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${statusInfo.step * 20}%` }} className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.4)]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-[2.5rem] border-orange-500/10 shadow-2xl shadow-orange-500/[0.03]">
                        <AnimatePresence mode="wait">
                            {isFreelancer ? (
                                <motion.div key="freelancer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="text-center py-6 space-y-6">
                                            <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Clock className="w-10 h-10 text-zinc-400" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Awaiting Client</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Agreement is created. Share the link with your client so they can fund the escrow.</p>
                                        </div>
                                    )}
                                    {(agreement.status === 'FUNDED' || agreement.status === 'REVISION') && (
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                                <Lock className="w-9 h-9 text-emerald-400" />
                                            </div>
                                            <div className="text-center">
                                                <h2 className="text-4xl font-black mb-3">Funds Locked</h2>
                                                <p className="text-zinc-400 font-medium text-sm">Escrow is secure. You can now start the work and submit deliverables when ready.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 p-10 cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all">
                                                    <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-2xl text-orange-600">
                                                            <Paperclip className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">{selectedFile ? selectedFile.name : 'Choose Asset'}</span>
                                                    </div>
                                                </label>
                                                <button disabled={actionLoading || !selectedFile} onClick={() => handleAction('SUBMIT')} className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem] shadow-xl">
                                                    {actionLoading ? 'Uploading...' : 'Deliver Work'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {agreement.status === 'SUBMITTED' && (
                                        <div className="text-center py-10 space-y-6">
                                            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                                                <FileText className="w-9 h-9 text-amber-500" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Review Pending</h2>
                                            <p className="text-zinc-400 font-medium text-sm">You have submitted the work. Waiting for the client to approve or request revision.</p>
                                        </div>
                                    )}
                                    {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6 text-center">
                                            <CheckCircle2 className="w-20 h-20 text-orange-400 mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Work Completed</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Agreement settled on Injective.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : isClient ? (
                                <motion.div key="client" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="space-y-8 text-center">
                                            <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                                                <DollarSign className="w-9 h-9 text-orange-400" />
                                            </div>
                                            <h2 className="text-4xl font-black tracking-tight">Fund Agreement</h2>
                                            <p className="text-zinc-400 font-medium text-sm mt-4">Depositing {agreementAmount} into Accord Escrow. Funds stay locked until you approve the work.</p>
                                            <button disabled={actionLoading} onClick={() => handleAction('FUND')} className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem]">
                                                {actionLoading ? 'Processing...' : `Deposit ${agreementAmount}`}
                                            </button>
                                        </div>
                                    )}
                                    {agreement.status === 'SUBMITTED' && (
                                        <div className="space-y-8 text-center">
                                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                                                <Clock className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Work Submitted!</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Review deliverables and decide whether to approve or request revision.</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button disabled={actionLoading} onClick={() => handleAction('APPROVE')} className="w-full py-4 orange-glow-btn text-white font-black text-xs uppercase tracking-widest rounded-2xl">
                                                    Approve Work
                                                </button>
                                                <button disabled={actionLoading} onClick={() => handleAction('REVISION')} className="w-full py-4 bg-zinc-800/50 border border-amber-500/40 text-amber-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-500 hover:text-white transition-all">
                                                    Request Revision
                                                </button>
                                            </div>
                                            <button disabled={actionLoading} onClick={() => handleAction('CANCEL_REQUEST')} className="opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[3px] mt-4 underline underline-offset-4">
                                                Cancel & Dispute
                                            </button>
                                        </div>
                                    )}
                                    {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6 text-center">
                                            <CheckCircle2 className="w-20 h-20 text-orange-400 mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Work Completed</h2>
                                            <p className="text-zinc-400 font-medium text-sm mb-8">You can now download the final asset.</p>
                                            <button className="orange-glow-btn text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest text-center">Download Final File</button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="space-y-6 py-10 text-center">
                                    <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-black tracking-tight">Viewing as Guest</h2>
                                    <button onClick={() => navigate('/')} className="orange-glow-btn text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest">Connect Wallet</button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="glass-panel rounded-[2rem] overflow-hidden flex flex-col h-[525px] border-zinc-200 dark:border-white/5 shadow-xl">
                    <div className="p-7 border-b border-white/20 dark:border-white/5 flex items-center justify-between shrink-0 bg-white dark:bg-[#111111]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Project Notes</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-7 space-y-5 bg-zinc-50/30 dark:bg-black/20">
                        {!isParticipant ? (
                             <div className="text-center py-16 text-zinc-300 dark:text-neutral-600">
                                <Info className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                <span className="text-xs font-black uppercase tracking-[5px]">Private Chat</span>
                                <p className="text-[10px] mt-2 opacity-60">Locked for non-participants</p>
                             </div>
                        ) : messages.length > 0 ? messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === address?.toLowerCase() ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-[1.25rem] text-sm font-semibold shadow-sm ${
                                    m.sender === address?.toLowerCase()
                                        ? 'bg-zinc-900 text-white rounded-br-none'
                                        : 'bg-white dark:bg-[#1a1919] text-zinc-800 dark:text-white border border-zinc-100 dark:border-white/5 rounded-bl-none'
                                }`}>
                                    {m.content}
                                </div>
                                <span className="text-[8px] text-zinc-400 dark:text-neutral-600 mt-1.5 uppercase font-bold px-1">{m.sender === address?.toLowerCase() ? 'You' : 'Team Member'}</span>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-zinc-300 dark:text-neutral-600">
                                <span className="text-xs font-black uppercase tracking-[5px]">No messages yet</span>
                            </div>
                        )}
                    </div>

                    {isParticipant && (
                        <div className="p-5 bg-white dark:bg-[#131313] border-t border-white/20 dark:border-white/5">
                            {canMessage ? (
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-semibold text-zinc-800 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-orange-300 dark:focus:border-orange-500/40 transition-all placeholder:text-zinc-400 dark:placeholder:text-neutral-600"
                                        placeholder="Add a progress update..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <button className="orange-glow-btn text-white p-3.5 rounded-2xl">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-2 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                                    <p className="text-[10px] items-center justify-center flex gap-2 font-black text-zinc-400 uppercase tracking-widest">
                                        <Lock className="w-3 h-3" />
                                        Messaging Locked until Funded
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
