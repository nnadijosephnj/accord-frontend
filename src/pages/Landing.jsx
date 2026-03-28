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
    <div className="min-h-screen bg-[#f5f6f7] font-sans overflow-x-hidden text-zinc-900">

      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-zinc-200/40 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-orange-600" />
            <span className="text-xl font-extrabold tracking-tight text-orange-700">ACCORD</span>
          </div>
          <button
            onClick={() => connectWallet()}
            className="orange-glow-btn text-white font-bold py-2 px-6 rounded-full text-sm active:scale-95"
          >
            {isConnecting ? 'Opening...' : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-44 pb-32 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-block text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-8 px-5 py-2 bg-orange-50 rounded-full border border-orange-100">
              Built on Injective · Web3 Escrow
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.05]">
              Secure Agreements<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#a13900 0%,#ff793e 100%)' }}>
                for Digital Work
              </span>
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Create a deal. Share a link. Get paid safely.<br />No middleman. No trust required.
            </p>
            <button
              onClick={() => connectWallet()}
              disabled={isConnecting}
              className="orange-glow-btn group inline-flex items-center gap-3 text-white text-lg font-bold px-10 py-4 rounded-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet to Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-zinc-900 mb-4">How Accord Works</h2>
            <div className="w-16 h-1 mx-auto rounded-full thermal-gradient" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Create Agreement', desc: 'Define your terms and generate a secure shareable link.', icn: <UserCheck className="w-7 h-7" /> },
              { num: '2', title: 'Lock Payment', desc: 'Client deposits USDT held securely by the smart contract.', icn: <LockKeyhole className="w-7 h-7" /> },
              { num: '3', title: 'Approve & Get Paid', desc: 'Payment releases instantly when work is approved.', icn: <Coins className="w-7 h-7" /> }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-panel rounded-[2rem] p-8 hover:shadow-[0_20px_40px_rgba(234,88,12,0.1)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-orange-600 bg-orange-50">
                  {step.icn}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-3">{step.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span className="text-lg font-black text-zinc-900 tracking-tight">ACCORD</span>
          </div>
          <span className="text-sm text-zinc-400 border border-zinc-200 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Built on Injective
          </span>
          <p className="text-sm text-zinc-400 font-medium">Injective Africa Buildathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
