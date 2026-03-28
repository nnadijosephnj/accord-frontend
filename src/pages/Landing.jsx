import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Coins, ArrowRight, UserCheck, Moon, Sun } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { address, connectWallet, isConnecting } = useWallet();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (address) {
      navigate('/dashboard');
    }
  }, [address, navigate]);

  return (
    <div className="min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] font-sans overflow-x-hidden text-zinc-900 dark:text-white">

      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-200/20 dark:bg-orange-500/[0.04] rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-zinc-200/40 dark:bg-orange-500/[0.02] rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/70 dark:bg-neutral-950/60 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(161,57,0,0.05)] dark:shadow-none border-b border-white/20 dark:border-orange-500/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-light.png" alt="Accord" className="h-9 dark:hidden" />
            <img src="/logo-dark.png" alt="Accord" className="h-9 hidden dark:block" />
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-zinc-400 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => connectWallet()}
              className="orange-glow-btn text-white font-bold py-2 px-6 rounded-full text-sm active:scale-95"
            >
              {isConnecting ? 'Opening...' : 'Connect Wallet'}
            </button>
          </div>
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
            <span className="inline-block text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em] mb-8 px-5 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-100 dark:border-orange-500/20">
              Built on Injective · Web3 Escrow
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.05] text-zinc-900 dark:text-white">
              Secure Agreements<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#a13900 0%,#ff793e 100%)' }}>
                for Digital Work
              </span>
            </h1>
            <p className="text-xl text-zinc-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
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
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">How Accord Works</h2>
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
                className="glass-panel rounded-[2rem] p-8 hover:shadow-[0_20px_40px_rgba(234,88,12,0.1)] dark:hover:shadow-[0_20px_40px_rgba(255,145,87,0.08)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10">
                  {step.icn}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-700 dark:text-orange-400 font-black text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-zinc-500 dark:text-neutral-400 leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-light.png" alt="Accord" className="h-7 dark:hidden" />
            <img src="/logo-dark.png" alt="Accord" className="h-7 hidden dark:block" />
          </div>
          <span className="text-sm text-zinc-400 dark:text-neutral-500 border border-zinc-200 dark:border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Built on Injective
          </span>
          <p className="text-sm text-zinc-400 dark:text-neutral-500 font-medium">Injective Africa Buildathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
