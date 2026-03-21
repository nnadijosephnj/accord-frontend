import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, ArrowLeft, CheckCircle2, Circle, Clock, 
    Lock, Check, Send, ExternalLink, Paperclip, 
    MessageSquare, DollarSign, User, Calendar as CalendarIcon, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { apiCall, uploadFileCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI } from '../utils/contractABI';

export default function AgreementRoom() {
    const { id } = useParams();
    const { address, signer, isLoggedIn, connectWallet } = useWallet();
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
    }, [id, isLoggedIn]); // Refresh when login state changes

    const loadAgreement = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/api/agreements/${id}`);
            setAgreement(data);
            
            // Load files associated with agreement
            const fileData = await apiCall(`/api/agreements/${id}/files`);
            setFiles(fileData || []);
        } catch (e) {
            if (e.message !== 'AUTHENTICATION_REQUIRED') {
                console.warn(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await apiCall(`/api/messages/${id}`);
            setMessages(data || []);
        } catch (e) {
            // Ignore auth errors for background sync
        }
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
                
                // Approve USDT
                const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS);
                if (allowance < amountInUnits) {
                    const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amountInUnits);
                    await approveTx.wait();
                }
                
                // Deposit
                const tx = await contract.depositFunds(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { 
                    method: 'PATCH', 
                    body: JSON.stringify({ status: 'FUNDED' }) 
                });
            } else if (action === 'APPROVE') {
                const tx = await contract.approveWork(contractId);
                await tx.wait();
                await apiCall(`/api/agreements/${id}/status`, { 
                    method: 'PATCH', 
                    body: JSON.stringify({ status: 'COMPLETED' }) 
                });
            } else if (action === 'SUBMIT') {
                if (!selectedFile) return alert("Select a preview file first!");
                
                const tx = await contract.submitWork(contractId);
                await tx.wait();

                // Upload file metadata to backend
                const formData = new FormData();
                formData.append('preview', selectedFile);
                formData.append('agreementId', id);
                await uploadFileCall('/api/upload', formData);

                await apiCall(`/api/agreements/${id}/status`, { 
                    method: 'PATCH', 
                    body: JSON.stringify({ status: 'SUBMITTED' }) 
                });
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
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin" />
        </div>
    );

    const isFreelancer = address?.toLowerCase() === agreement.freelancer_wallet?.toLowerCase();
    const isClient = address?.toLowerCase() === agreement.client_wallet?.toLowerCase();

    const getStatusInfo = (status) => {
        const s = status?.toUpperCase();
        switch(s) {
            case 'PENDING': return { label: 'Pending Payment', color: 'bg-gray-100 text-gray-500', step: 1 };
            case 'FUNDED': return { label: 'Funded / Locked', color: 'bg-blue-100 text-blue-700', step: 2 };
            case 'SUBMITTED': return { label: 'Work Submitted', color: 'bg-amber-100 text-amber-700', step: 3 };
            case 'REVISION': return { label: 'Revision Needed', color: 'bg-orange-100 text-orange-600', step: 3 };
            case 'COMPLETED': return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', step: 5 };
            case 'CANCELLED': return { label: 'Cancelled', color: 'bg-rose-100 text-rose-600', step: 0 };
            default: return { label: s, color: 'bg-gray-50 text-gray-300', step: 1 };
        }
    };

    const statusInfo = getStatusInfo(agreement.status);

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
            {/* Header Sticky */}
            <div className="bg-white border-b border-gray-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-navy transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-lg sm:text-2xl font-black text-navy tracking-tight">{agreement.title}</h1>
                        <div className="flex items-center justify-center gap-2 mt-1.5">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">#{agreement.id?.slice(0, 8)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                        <span className="text-xl font-black text-navy">{agreement.amount_usdt} <span className="text-sm font-bold text-teal">USDT</span></span>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 mt-10">
                {/* Timeline Section */}
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 mb-10 overflow-hidden">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-gray-50 z-0">
                            <motion.div 
                                className="h-full bg-teal" 
                                initial={{width: '0%'}} 
                                animate={{width: `${(statusInfo.step - 1) * 25}%`}} 
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
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 bg-white ${
                                    statusInfo.step >= s.step 
                                        ? 'border-teal shadow-[0_0_15px_rgba(23,185,120,0.3)]' 
                                        : 'border-gray-50'
                                }`}>
                                    {statusInfo.step > s.step ? (
                                        <Check className="w-6 h-6 text-teal" />
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${statusInfo.step === s.step ? 'bg-teal animate-pulse' : 'bg-gray-100'}`} />
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.step >= s.step ? 'text-navy' : 'text-gray-200'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 line-clamp-1">Freelancer</p>
                        <a href={`https://testnet.blockscout.injective.network/address/${agreement.freelancer_wallet}`} target="_blank" className="text-xs font-bold text-navy truncate hover:text-teal transition-all flex items-center gap-1.5">
                             {agreement.freelancer_wallet?.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 line-clamp-1">Client</p>
                        <a href={`https://testnet.blockscout.injective.network/address/${agreement.client_wallet}`} target="_blank" className="text-xs font-bold text-navy truncate hover:text-teal transition-all flex items-center gap-1.5">
                            {agreement.client_wallet?.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Created</p>
                         <p className="text-xs font-bold text-navy uppercase truncate">
                            {new Date(agreement.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Status</p>
                         <p className="text-xs font-black text-navy uppercase truncate flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusInfo.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                            {statusInfo.step === 5 ? 'Finished' : 'In Progress'}
                        </p>
                    </div>
                </div>

                {/* Main Action Panel */}
                <div className="bg-[#0A3D62] text-white p-10 sm:p-14 rounded-[48px] shadow-2xl shadow-navy/20 mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 text-center max-w-lg mx-auto">
                        <AnimatePresence mode="wait">
                            {(!isLoggedIn && (isFreelancer || isClient)) ? (
                                <motion.div key="signin" initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                    <Lock className="w-16 h-16 text-teal mx-auto mb-4" />
                                    <h2 className="text-3xl font-black tracking-tight">Access Restricted</h2>
                                    <p className="text-blue-100/60 font-bold text-sm max-w-sm mx-auto">
                                        You are a participant in this agreement, but you must sign in to take any actions.
                                    </p>
                                    <button 
                                        onClick={() => connectWallet()}
                                        className="bg-teal text-white py-4 px-12 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-teal/20"
                                    >
                                        Sign In to Accord
                                    </button>
                                </motion.div>
                            ) : isFreelancer ? (
                                <motion.div key="freelancer" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="space-y-6">
                                            <ShieldCheck className="w-16 h-16 text-teal mx-auto mb-6" />
                                            <h2 className="text-3xl font-black tracking-tight leading-tight">Waiting for client <br/> to fund this agreement</h2>
                                            <p className="text-blue-100/60 font-bold text-sm tracking-tight leading-relaxed max-w-sm mx-auto">
                                                The client must deposit the agreed ${agreement.amount_usdt} USDT into the Injective Escrow before you start work.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/deal/${id}`);
                                                    alert("Link copied!");
                                                }}
                                                className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all"
                                            >
                                                Copy Share Link
                                            </button>
                                        </div>
                                    )}
                                    {(agreement.status === 'FUNDED' || agreement.status === 'REVISION') && (
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-teal/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <Paperclip className="w-8 h-8 text-teal" />
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">Payment locked! <br/> Start working 🔒</h2>
                                            <p className="text-blue-100/70 font-bold text-sm">Please upload your preview as watermarked or high-quality proof.</p>
                                            
                                            <div className="flex flex-col gap-4 mt-10">
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                                />
                                                <div 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="bg-navy/40 border-2 border-dashed border-white/20 p-8 rounded-[32px] cursor-pointer hover:border-teal/50 transition-all flex flex-col items-center gap-2 group"
                                                >
                                                    <Paperclip className="w-6 h-6 text-teal group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold text-blue-100 truncate w-full text-center">
                                                        {selectedFile ? selectedFile.name : 'Select work preview file'}
                                                    </span>
                                                </div>
                                                <button 
                                                    disabled={actionLoading || !selectedFile}
                                                    onClick={() => handleAction('SUBMIT')}
                                                    className="w-full py-6 bg-teal text-white font-black text-sm uppercase tracking-[4px] rounded-[24px] shadow-2xl shadow-teal/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                                                >
                                                    {actionLoading ? 'Uploading to IPFS...' : 'Submit Work'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                     {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6">
                                            <CheckCircle2 className="w-20 h-20 text-teal mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Payment received! 🎉</h2>
                                            <p className="text-blue-100/60 font-bold text-sm">Agreement successfully settled on Injective.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : isClient ? (
                                <motion.div key="client" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>
                                    {agreement.status === 'PENDING' && (
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-teal/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <DollarSign className="w-8 h-8 text-teal" />
                                            </div>
                                            <h2 className="text-4xl font-black tracking-tight leading-tight">Fund This <br/> Agreement</h2>
                                            <p className="text-blue-100/60 font-bold text-sm mt-4">You are depositing ${agreement.amount_usdt} USDT into Accord Escrow. This funds will stay in the contract until you approve the work.</p>
                                            
                                            <button 
                                                disabled={actionLoading}
                                                onClick={() => handleAction('FUND')}
                                                className="w-full py-6 bg-teal text-white font-black text-sm uppercase tracking-[4px] rounded-[24px] shadow-2xl shadow-teal/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                                            >
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
                                            <p className="text-blue-100/60 font-bold text-sm">Review the deliverables below and decide whether to approve or request revision.</p>
                                            
                                            {/* Preview Display if files exist */}
                                            {files.length > 0 && (
                                                <div className="bg-navy/40 p-6 rounded-[24px] border border-white/10 flex items-center justify-between mb-8 group">
                                                    <div className="flex items-center gap-4 truncate">
                                                        <Paperclip className="w-6 h-6 text-teal" />
                                                        <div className="text-left overflow-hidden">
                                                            <p className="text-xs font-black text-white truncate max-w-[200px]">{files[0].file_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Preview File on IPFS</p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={`https://gateway.pinata.cloud/ipfs/${files[0].ipfs_hash}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="bg-white/10 p-3 rounded-xl hover:bg-teal transition-all text-white"
                                                    >
                                                        View Proof
                                                    </a>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button 
                                                    disabled={actionLoading}
                                                    onClick={() => handleAction('APPROVE')}
                                                    className="w-full py-5 bg-teal text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg border-2 border-transparent hover:scale-105 transition-all"
                                                >
                                                    {actionLoading ? 'Releasing Funds...' : 'Approve Work ✅'}
                                                </button>
                                                <button 
                                                    className="w-full py-5 bg-navy/40 border-2 border-amber-500/50 text-amber-500 font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-amber-500 hover:text-white transition-all"
                                                >
                                                    Request Revision 🔄
                                                </button>
                                            </div>
                                            <button className="opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[3px] mt-6 underline underline-offset-4">
                                                Cancel & Dispute ❌
                                            </button>
                                        </div>
                                    )}
                                    {agreement.status === 'COMPLETED' && (
                                        <div className="space-y-6">
                                            <CheckCircle2 className="w-20 h-20 text-teal mx-auto" />
                                            <h2 className="text-4xl font-black tracking-tight">Work Completed!</h2>
                                            <p className="text-blue-100/60 font-bold text-sm mb-8 italic">You can now download the final asset below.</p>
                                            <button className="bg-teal text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-teal/20 shadow-xl transition-all active:scale-95">
                                                Download Final File 🔗
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="space-y-6 py-10">
                                    <AlertCircle className="w-16 h-16 text-teal mx-auto mb-4" />
                                    <h2 className="text-3xl font-black tracking-tight">Viewing as Guest</h2>
                                    <p className="text-blue-100/60 font-bold text-sm tracking-tight leading-relaxed max-w-sm mx-auto">
                                        Connecting your wallet allows you to see your role and take actions in this agreement room.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/')}
                                        className="bg-teal text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest"
                                    >
                                        Connect Wallet
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mt-10">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-teal" />
                            <h3 className="text-xl font-black text-navy tracking-tight">Project Notes</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest underline decoration-teal/20 underline-offset-4">Log Thread</span>
                    </div>
                    
                    <div className="h-[400px] overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                        {messages.length > 0 ? messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === address?.toLowerCase() ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-5 rounded-[24px] text-sm font-bold shadow-sm ${
                                    m.sender === address?.toLowerCase() 
                                        ? 'bg-navy text-white rounded-br-none' 
                                        : 'bg-white text-navy border border-gray-100 rounded-bl-none'
                                }`}>
                                    {m.content}
                                </div>
                                <span className="text-[9px] font-black text-gray-300 mt-2 uppercase tracking-tighter">
                                    {m.sender?.slice(0, 6)}... • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-300">
                                <span className="text-xs font-black uppercase tracking-[5px] italic">No messages yet</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100 flex gap-3">
                        <input 
                            className="flex-1 bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-navy outline-none focus:bg-white focus:border-teal/30 transition-all shadow-inner"
                            placeholder="Add a progress update or note..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="bg-teal text-white p-4 rounded-2xl shadow-xl shadow-teal/10 hover:shadow-teal/30 hover:scale-105 active:scale-95 transition-all">
                            <Send className="w-5 h-5 transition-transform" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
