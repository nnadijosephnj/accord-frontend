import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, User, Handshake, LogOut, ChevronRight, Briefcase, Code } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
    const { userProfile, address } = useWallet();
    const navigate = useNavigate();

    return (
        <nav className="fixed w-full top-0 left-0 bg-white border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-[#0A3D62]" />
                    <span className="text-xl font-black tracking-tight text-[#0A3D62]">ACCORD</span>
                </Link>
                <div 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm relative overflow-hidden group-hover:border-teal/50 transition-all">
                        <User className="w-5 h-5 text-[#0A3D62] group-hover:text-teal" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <div className="absolute inset-0 bg-[#0A3D62]/60 backdrop-blur-md" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="p-8 sm:p-12 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0A3D62] mb-3">What is your role?</h2>
                    <p className="text-gray-400 font-bold text-sm mb-12">Select your role in this work agreement</p>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Freelancer Card */}
                        <div 
                            onClick={() => navigate('/create/freelancer')}
                            className="group cursor-pointer bg-[#F9FAFB] border-2 border-transparent hover:border-[#17B978] hover:bg-teal/5 p-8 rounded-[24px] transition-all flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                                👨‍💻
                            </div>
                            <h3 className="text-xl font-bold text-[#0A3D62] mb-2">I am the Freelancer</h3>
                            <p className="text-[13px] text-gray-500 font-bold leading-relaxed">
                                I will do the work<br/> and receive payment
                            </p>
                        </div>

                        {/* Client Card */}
                        <div 
                            onClick={() => navigate('/create/client')}
                            className="group cursor-pointer bg-[#F9FAFB] border-2 border-transparent hover:border-[#17B978] hover:bg-teal/5 p-8 rounded-[24px] transition-all flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                                💼
                            </div>
                            <h3 className="text-xl font-bold text-[#0A3D62] mb-2">I am the Client</h3>
                            <p className="text-[13px] text-gray-500 font-bold leading-relaxed">
                                I will pay for the work<br/> to be done
                            </p>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-full py-6 bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-[#0A3D62] transition-colors mt-4"
                >
                    Cancel
                </button>
            </motion.div>
        </div>
    );
}

export default function Home() {
    const { userProfile, logout } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pt-20">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="text-center w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl font-black text-[#0A3D62] mb-4 tracking-tight">
                            Welcome back 👋
                        </h1>
                        <p className="text-gray-400 text-lg sm:text-xl font-bold italic">
                            What would you like to do today?
                        </p>
                    </motion.div>

                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-[#17B978] hover:bg-[#129A64] text-white font-black text-lg py-6 rounded-[20px] transition-all shadow-xl hover:shadow-[#17B978]/30 shadow-[#17B978]/10 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        CREATE AGREEMENT
                    </motion.button>
                </div>
            </main>

            <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
