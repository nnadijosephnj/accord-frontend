import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe } from 'lucide-react';

export default function Landing() {
    const { address, connectWallet, isConnecting } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (address) {
            navigate('/dashboard');
        }
    }, [address, navigate]);

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans selection:bg-teal selection:text-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <span className="text-2xl font-bold text-navy tracking-tight italic">Accord</span>
                </div>
                <button 
                    onClick={() => connectWallet()}
                    disabled={isConnecting}
                    className="px-6 py-2.5 bg-navy text-white rounded-full font-semibold hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isConnecting ? 'Opening Wallet...' : 'Connect Wallet'}
                </button>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                >
                    <h1 className="text-6xl md:text-7xl font-bold text-navy leading-tight mb-8">
                        The Trust Layer for <br/> 
                        <span className="text-teal">Global Freelancing</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                        Scale your business with peace of mind. Accord locks payments in secure escrow smart contracts 
                        on the Injective blockchain, ensuring you're paid for every job you finish.
                    </p>
                    
                    <button 
                        onClick={() => connectWallet()}
                        className="group relative px-10 py-5 bg-navy text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Connect your Keplr Wallet
                            < Zap className="w-5 h-5 fill-teal text-teal group-hover:animate-pulse" />
                        </span>
                        <div className="absolute inset-0 bg-teal rounded-2xl scale-0 group-hover:scale-105 transition-transform duration-300 -z-10 blur-xl opacity-20"></div>
                    </button>
                </motion.div>

                {/* Simple 3-Step Preview */}
                <div className="grid md:grid-cols-3 gap-12 mt-40 w-full">
                    {[
                        { icon: Shield, title: "Lock Payments", text: "Clients deposit USDT into a secure Injective smart contract before work starts." },
                        { icon: Zap, title: "Work & Review", text: "Submit watermarked previews. Request revisions. Built for professional workflows." },
                        { icon: Globe, title: "Instant Release", text: "Get paid instantly in USDT as soon as the work is approved. No middlemen." }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="w-14 h-14 bg-teal bg-opacity-10 rounded-2xl flex items-center justify-center mb-6">
                                <feature.icon className="w-8 h-8 text-teal" />
                            </div>
                            <h3 className="text-2xl font-bold text-navy mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">{feature.text}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2 opacity-50 grayscale">
                        <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="text-lg font-bold text-navy">Accord Escrow</span>
                    </div>
                    <p className="text-gray-400 text-sm">© 2026 Accord • Built for Injective Ecosystem</p>
                </div>
            </footer>
        </div>
    );
}
