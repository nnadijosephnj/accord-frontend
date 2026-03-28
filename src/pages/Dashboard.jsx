import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, User, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
    const { userProfile, address } = useWallet();
    const navigate = useNavigate();
    const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;

    return (
        <nav className="fixed w-full top-0 left-0 z-50 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-orange-600" />
                    <span className="text-xl font-extrabold tracking-tight text-orange-700">ACCORD</span>
                </Link>
                <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    {/* Wallet pill */}
                    {address && (
                        <span className="hidden md:flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-100">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    )}
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-200 shadow-sm group-hover:border-orange-400 transition-all">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>
    );
}

function RoleModal({ isOpen, onClose }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full sm:max-w-lg glass-panel rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-zinc-900">What is your role?</h2>
                        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-zinc-500 font-medium text-sm mb-8">Select your role in this work agreement</p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Freelancer Card */}
                        <div
                            onClick={() => navigate('/create/freelancer')}
                            className="group cursor-pointer bg-white/50 border-2 border-white/60 hover:border-orange-300 hover:bg-orange-50/50 p-7 rounded-[1.5rem] transition-all"
                        >
                            <div className="w-14 h-14 glass-panel rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:shadow-[0_8px_20px_rgba(234,88,12,0.15)] transition-all">
                                👨‍💻
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 mb-2">I am the Freelancer</h3>
                            <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                                I will do the work<br />and receive payment
                            </p>
                        </div>

                        {/* Client Card */}
                        <div
                            onClick={() => navigate('/create/client')}
                            className="group cursor-pointer bg-white/50 border-2 border-white/60 hover:border-orange-300 hover:bg-orange-50/50 p-7 rounded-[1.5rem] transition-all"
                        >
                            <div className="w-14 h-14 glass-panel rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:shadow-[0_8px_20px_rgba(234,88,12,0.15)] transition-all">
                                💼
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 mb-2">I am the Client</h3>
                            <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                                I will pay for the work<br />to be done
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function Home() {
    const { userProfile, logout, isLoggedIn, connectWallet, address } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f5f6f7] font-sans pt-16">
            {/* Background blobs */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-zinc-200/40 rounded-full blur-[150px] -z-10 pointer-events-none" />

            <Navbar />

            <main className="max-w-7xl mx-auto px-6 h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] block mb-4">
                            Welcome back
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 mb-3 tracking-tight">
                            {userProfile?.display_name ? `Hey, ${userProfile.display_name} 👋` : 'Welcome 👋'}
                        </h1>
                        <p className="text-zinc-500 text-lg font-medium">
                            What would you like to do today?
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setIsModalOpen(true)}
                        className="orange-glow-btn w-full text-white font-black text-base py-5 rounded-[1.5rem] flex items-center justify-center gap-3 group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        CREATE AGREEMENT
                    </motion.button>
                </div>
            </main>

            {/* Mobile FAB (only shows when modal is closed) */}
            {!isModalOpen && (
                <div className="md:hidden fixed bottom-8 right-6 z-50">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-14 h-14 thermal-gradient text-white rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300"
                    >
                        <Plus className="w-7 h-7" />
                    </button>
                </div>
            )}

            <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
