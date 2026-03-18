import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, Coins, ArrowRight, UserCheck } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { address, connectWallet, isConnecting } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (address) {
      navigate('/dashboard');
    }
  }, [address, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans overflow-x-hidden text-gray-800">
      {/* Navbar Minimal */}
      <nav className="fixed w-full z-50 bg-[#0A3D62]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#17B978]" />
            <span className="text-2xl font-bold tracking-tight text-white">ACCORD</span>
          </div>
          <div>
            <button 
              onClick={connectWallet}
              className="bg-[#17B978] hover:bg-[#129A64] text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(23,185,120,0.3)] hover:shadow-[0_0_25px_rgba(23,185,120,0.5)] active:scale-95"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A3D62] text-white isolate">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#17B978_1px,transparent_0)] [background-size:40px_40px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05233A] to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Secure Agreements <br/> for Digital Work
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 font-light">
              Create a deal. Share a link. Get paid safely. No middleman.
            </p>
            
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#17B978] text-white text-lg font-semibold px-8 py-4 rounded-full transition-all hover:bg-white hover:text-[#0A3D62] shadow-xl hover:shadow-[0_0_30px_rgba(23,185,120,0.6)] active:scale-95"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet to Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[#0A3D62]">How Accord Works</h2>
            <div className="w-20 h-1 bg-[#17B978] mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Create Agreement', desc: 'Define your terms and generate a secure link.', icn: <UserCheck className="w-8 h-8"/> },
              { num: '2', title: 'Lock Payment', desc: 'Client deposits USDT which is held securely by code.', icn: <LockKeyhole className="w-8 h-8"/> },
              { num: '3', title: 'Approve & Get Paid', desc: 'Payment releases instantly when work is approved.', icn: <Coins className="w-8 h-8"/> }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-[#F5F5F5] p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 mb-6 text-[#17B978]">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-2xl border border-gray-50">
                    {step.num}
                  </div>
                  {step.icn}
                </div>
                <h3 className="text-xl font-bold text-[#0A3D62] mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05233A] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#17B978]" />
            <span className="text-xl font-bold text-white tracking-wide">ACCORD</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#17B978]"></span>
              Built on Injective
            </span>
          </div>
          <p className="text-sm">Injective Africa Buildathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
