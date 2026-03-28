import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ArrowLeft, CheckCircle2, Circle, Clock,
    Lock, Check, Send, ExternalLink, Paperclip,
    MessageSquare, DollarSign, User, Calendar as CalendarIcon, X, AlertCircle, RefreshCw, Moon, Sun
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall, uploadFileCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI } from '../utils/contractABI';

export default function AgreementRoom() {
    const { id } = useParams();
    const { address, signer, isLoggedIn, connectWallet } = useWallet();
    const { isDark, toggle } = useTheme();
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadAgreement();
        loadMessages();
    }, [id, isLoggedIn]);

    const loadAgreement = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/api/agreements/${id}`);
            setAgreement(data);
            const fileData = await apiCall(`/api/agreements/${id}/files`);
            setFiles(fileData || []);
        } catch (e) {
            if (e.message !== 'AUTHENTICATION_REQUIRED') console.warn(e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await apiCall(`/api/messages/${id}`);
            setMessages(data || []);
        } catch (e) {}
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        try {
            const newMessage = await apiCall('/api/messages', {
                method: 'POST',
                body: JSON.stringify({ agreement_id: id, content: message })
            });
            setMessages([...messages, newMessage]);
            setMessage('');
        } catch (e) {
            alert(e.message);
        }
    };

    const handleAction = async (action) => {
        try {
            setActionLoading(true);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
            const contractId = agreement.contract_agreement_id;

            if (action === 'FUND') {
                const amountInUnits = ethers.parseUnits(agreement.amount_usdt, 6);
                const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS);
                if (allowance < amountInUnits) {
                    const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amountInUnits);
                    await approveTx.wait();
                }
                const tx = await contract.depositFunds(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'FUNDED' }) });
            } else if (action === 'APPROVE') {
                const tx = await contract.approveWork(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) });
            } else if (action === 'SUBMIT') {
                if (!selectedFile) return alert("Select a preview file first!");
                const tx = await contract.submitWork(contractId);
                await tx.wait();
                const formData = new FormData();
                formData.append('preview', selectedFile);
                formData.append('agreementId', id);
                await uploadFileCall('/api/upload', formData);
                await apiCall(`/api/agreements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'SUBMITTED' }) });
            }

            await loadAgreement();
        } catch (error) {
            console.error(error);
            alert("Transaction error: " + (error.reason || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || !agreement) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7] dark:bg-[#0e0e0e]">
            <div className="flex flex-col items-center gap-4 text-zinc-400 dark:text-neutral-500">
                <RefreshCw className="w-10 h-10 animate-spin text-orange-400" />
                <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
            </div>
        </div>
    );

    const isFreelancer = address?.toLowerCase() === agreement.freelancer_wallet?.toLowerCase();
    const isClient = address?.toLowerCase() === agreement.client_wallet?.toLowerCase();

    const getStatusInfo = (status) => {
        const s = status?.toUpperCase();
        switch(s) {
            case 'PENDING':   return { label: 'Pending Payment',  color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-neutral-300',             step: 1 };
            case 'FUNDED':    return { label: 'Funded / Locked',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border dark:border-orange-500/20',   step: 2 };
            case 'SUBMITTED': return { label: 'Work Submitted',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',             step: 3 };
            case 'REVISION':  return { label: 'Revision Needed',  color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',         step: 3 };
            case 'COMPLETED': return { label: 'Completed',        color: 'bg-emerald-100 text-emerald-700 dark:bg-green-500/10 dark:text-green-400',         step: 5 };
            case 'CANCELLED': return { label: 'Cancelled',        color: 'bg-rose-100 text-rose-600 dark:bg-red-500/10 dark:text-red-400',                   step: 0 };
            default:          return { label: s,                  color: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800/30 dark:text-neutral-500',              step: 1 };
        }
    };

    const statusInfo = getStatusInfo(agreement.status);

    return (
        <div className="min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] font-sans pb-24">
            <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-orange-200/20 dark:bg-orange-500/[0.04] rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-zinc-200/40 dark:bg-orange-500/[0.02] rounded-full blur-[150px] -z-10" />

            {/* Header */}
            <div className="bg-white/70 dark:bg-neutral-950/60 backdrop-blur-xl border-b border-white/20 dark:border-orange-500/10 shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] dark:shadow-none py-4 px-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-zinc-400 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-base sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">{agreement.title}</h1>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                            <span className="text-[10px] text-zinc-300 dark:text-neutral-600 font-bold uppercase tracking-tighter">#{agreement.id?.slice(0, 8)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggle} className="p-2 rounded-xl text-zinc-400 dark:text-neutral-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all" aria-label="Toggle theme">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-400 dark:text-neutral-500 font-bold uppercase tracking-widest">Amount</span>
                            <span className="text-lg font-black text-zinc-900 dark:text-white">{agreement.amount_usdt} <span className="text-sm font-bold text-orange-600 dark:text-orange-400">USDT</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 mt-8">

                {/* Timeline */}
                <div className="glass-panel p-8 rounded-[2rem] mb-6 overflow-hidden">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-zinc-100 dark:bg-zinc-800 z-0">
                            <motion.div
                                className="h-full thermal-gradient"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(statusInfo.step - 1) * 25}%` }}
                            />
                        </div>

                        {[
                            { label: 'Created', step: 1 },
                            { label: 'Funded', step: 2 },
                            { label: 'Submitted', step: 3 },
                            { label: 'Reviewed', step: 4 },
                            { label: 'Completed', step: 5 }
                        ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 bg-white dark:bg-[#1a1919] ${
                                    statusInfo.step >= s.step
                                        ? 'border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.25)] dark:shadow-[0_0_15px_rgba(255,145,87,0.2)]'
                                        : 'border-zinc-100 dark:border-zinc-700/50'
                                }`}>
                                    {statusInfo.step > s.step ? (
                                        <Check className="w-5 h-5 text-orange-500" />
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${statusInfo.step === s.step ? 'bg-orange-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-700'}`} />
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.step >= s.step ? 'text-zinc-800 dark:text-white' : 'text-zinc-300 dark:text-neutral-600'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-panel p-5 rounded-[1.5rem]">
                        <p className="text-[9px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-1.5">Freelancer</p>
                        <a href={`https://testnet.blockscout.injective.network/address/${agreement.freelancer_wallet}`} target="_blank" className="text-xs font-bold text-zinc-700 dark:text-neutral-300 truncate hover:text-orange-600 dark:hover:text-orange-400 transition-all flex items-center gap-1.5">
                            {agreement.freelancer_wallet?.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="glass-panel p-5 rounded-[1.5rem]">
                        <p className="text-[9px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-1.5">Client</p>
                        <a href={`https://testnet.blockscout.injective.network/address/${agreement.client_wallet}`} target="_blank" className="text-xs font-bold text-zinc-700 dark:text-neutral-300 truncate hover:text-orange-600 dark:hover:text-orange-400 transition-all flex items-center gap-1.5">
                            {agreement.client_wallet?.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="glass-panel p-5 rounded-[1.5rem]">
                        <p className="text-[9px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-1.5">Created</p>
                        <p className="text-xs font-bold text-zinc-700 dark:text-neutral-300 uppercase truncate">
                            {new Date(agreement.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="glass-panel p-5 rounded-[1.5rem]">
                        <p className="text-[9px] text-zinc-400 dark:text-neutral-500 font-black uppercase tracking-widest mb-1.5">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${statusInfo.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {statusInfo.step === 5 ? 'Finished' : 'In Progress'}
                        </span>
                    </div>
                </div>

                {/* Main Action Panel */}
                <div className="bg-zinc-900 text-white p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-zinc-900/20 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-3xl -mr-32 -mt-32 thermal-gradient" />
                    <div className="relative z-10 text-center max-w-lg mx-auto">
                        <AnimatePresence mode="wait">
                            {(!isLoggedIn && (isFreelancer || isClient)) ? (
                                <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <Lock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-black tracking-tight">Access Restricted</h2>
                                    <p className="text-zinc-400 font-medium text-sm max-w-sm mx-auto">You are a participant but must sign in to take actions.</p>
                                    <button onClick={() => connectWallet()} className="orange-glow-btn text-white py-4 px-12 rounded-full font-black text-xs uppercase tracking-widest">
                                        Sign In to Accord
                                    </button>
                                </motion.div>
                            ) : isFreelancer ? (
                                <motion.div key="freelancer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="space-y-6">
                                            <ShieldCheck className="w-16 h-16 text-orange-400 mx-auto mb-6" />
                                            <h2 className="text-3xl font-black tracking-tight leading-tight">Waiting for client<br />to fund this agreement</h2>
                                            <p className="text-zinc-400 font-medium text-sm max-w-sm mx-auto">The client must deposit ${agreement.amount_usdt} USDT into the Injective Escrow before you start work.</p>
                                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/deal/${id}`); alert("Link copied!"); }} className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">
                                                Copy Share Link
                                            </button>
                                        </div>
                                    )}
                                    {(agreement.status === 'FUNDED' || agreement.status === 'REVISION') && (
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                                                <Paperclip className="w-9 h-9 text-orange-400" />
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">Payment locked!<br />Start working 🔒</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Upload your preview as watermarked or high-quality proof.</p>
                                            <div className="flex flex-col gap-4 mt-8">
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                                <div onClick={() => fileInputRef.current.click()} className="bg-zinc-800/50 border-2 border-dashed border-white/10 p-8 rounded-[2rem] cursor-pointer hover:border-orange-500/40 transition-all flex flex-col items-center gap-2">
                                                    <Paperclip className="w-6 h-6 text-orange-400" />
                                                    <span className="text-sm font-bold text-zinc-400 truncate w-full text-center">{selectedFile ? selectedFile.name : 'Select work preview file'}</span>
                                                </div>
                                                <button disabled={actionLoading || !selectedFile} onClick={() => handleAction('SUBMIT')} className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem]">
                                                    {actionLoading ? 'Uploading to IPFS...' : 'Submit Work'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6">
                                            <CheckCircle2 className="w-20 h-20 text-orange-400 mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Payment received! 🎉</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Agreement successfully settled on Injective.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : isClient ? (
                                <motion.div key="client" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                                                <DollarSign className="w-9 h-9 text-orange-400" />
                                            </div>
                                            <h2 className="text-4xl font-black tracking-tight leading-tight">Fund This<br />Agreement</h2>
                                            <p className="text-zinc-400 font-medium text-sm mt-4">Depositing ${agreement.amount_usdt} USDT into Accord Escrow. Funds stay locked until you approve the work.</p>
                                            <button disabled={actionLoading} onClick={() => handleAction('FUND')} className="w-full py-5 orange-glow-btn text-white font-black text-sm uppercase tracking-[4px] rounded-[1.5rem]">
                                                {actionLoading ? 'Approving USDT & Depositing...' : `Deposit ${agreement.amount_usdt} USDT`}
                                            </button>
                                        </div>
                                    )}
                                    {agreement.status === 'SUBMITTED' && (
                                        <div className="space-y-8">
                                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                                                <Clock className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Work Submitted!</h2>
                                            <p className="text-zinc-400 font-medium text-sm">Review the deliverables and decide whether to approve or request revision.</p>
                                            {files.length > 0 && (
                                                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/10 flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4 truncate">
                                                        <Paperclip className="w-5 h-5 text-orange-400" />
                                                        <div className="text-left overflow-hidden">
                                                            <p className="text-xs font-black text-white truncate max-w-[200px]">{files[0].file_name}</p>
                                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter italic">Preview on IPFS</p>
                                                        </div>
                                                    </div>
                                                    <a href={`https://gateway.pinata.cloud/ipfs/${files[0].ipfs_hash}`} target="_blank" rel="noreferrer" className="orange-glow-btn text-white text-xs font-bold px-4 py-2 rounded-xl">View Proof</a>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button disabled={actionLoading} onClick={() => handleAction('APPROVE')} className="w-full py-4 orange-glow-btn text-white font-black text-xs uppercase tracking-widest rounded-2xl">
                                                    {actionLoading ? 'Releasing Funds...' : 'Approve Work ✅'}
                                                </button>
                                                <button className="w-full py-4 bg-zinc-800/50 border border-amber-500/40 text-amber-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-500 hover:text-white transition-all">
                                                    Request Revision 🔄
                                                </button>
                                            </div>
                                            <button className="opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[3px] mt-4 underline underline-offset-4">Cancel & Dispute ❌</button>
                                        </div>
                                    )}
                                    {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6">
                                            <CheckCircle2 className="w-20 h-20 text-orange-400 mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Work Completed!</h2>
                                            <p className="text-zinc-400 font-medium text-sm mb-8">You can now download the final asset below.</p>
                                            <button className="orange-glow-btn text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest">Download Final File 🔗</button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="space-y-6 py-10">
                                    <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-black tracking-tight">Viewing as Guest</h2>
                                    <p className="text-zinc-400 font-medium text-sm max-w-sm mx-auto">Connecting your wallet allows you to see your role and take actions.</p>
                                    <button onClick={() => navigate('/')} className="orange-glow-btn text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest">Connect Wallet</button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="glass-panel rounded-[2rem] overflow-hidden">
                    <div className="p-7 border-b border-white/20 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Project Notes</h3>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-neutral-500 uppercase tracking-widest">Log Thread</span>
                    </div>

                    <div className="h-[360px] overflow-y-auto p-7 space-y-5 bg-zinc-50/30 dark:bg-black/20">
                        {messages.length > 0 ? messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === address?.toLowerCase() ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-[1.25rem] text-sm font-semibold shadow-sm ${
                                    m.sender === address?.toLowerCase()
                                        ? 'bg-zinc-900 text-white rounded-br-none'
                                        : 'bg-white dark:bg-[#1a1919] text-zinc-800 dark:text-white border border-zinc-100 dark:border-white/5 rounded-bl-none'
                                }`}>
                                    {m.content}
                                </div>
                                <span className="text-[9px] font-black text-zinc-300 dark:text-neutral-600 mt-2 uppercase tracking-tighter">
                                    {m.sender?.slice(0, 6)}... · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-zinc-300 dark:text-neutral-600">
                                <span className="text-xs font-black uppercase tracking-[5px]">No messages yet</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-5 bg-white/80 dark:bg-[#131313]/80 border-t border-white/20 dark:border-white/5 flex gap-3">
                        <input
                            className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-semibold text-zinc-800 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-orange-300 dark:focus:border-orange-500/40 transition-all placeholder:text-zinc-400 dark:placeholder:text-neutral-600"
                            placeholder="Add a progress update or note..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="orange-glow-btn text-white p-3.5 rounded-2xl">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
