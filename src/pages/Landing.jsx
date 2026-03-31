import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/engine';
import { ShieldCheck, LockKeyhole, Coins, ArrowRight, UserCheck, Moon, Sun, Shield, Zap, Lock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Counter({ from, to, duration = 2, delay = 0, formattingFn = (v) => v }) {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        delay,
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = formattingFn(value);
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, delay, inView, formattingFn]);

  return <span ref={nodeRef}>{formattingFn(from)}</span>;
}

export default function Landing() {
  const { address, connectWallet, isConnecting } = useWallet();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [init, setInit] = useState(false);

  // Mouse positional tracking for glowing cursor follower
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (address) {
      navigate('/dashboard');
    }
  }, [address, navigate]);

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        resize: true,
      },
      modes: {
        grab: { distance: 150, links: { opacity: 0.5 } },
      },
    },
    particles: {
      color: { value: "#ea580c" },
      links: {
        color: "#ea580c",
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: false,
        straight: false,
        outModes: { default: "bounce" },
      },
      number: { density: { enable: true, area: 800 }, value: 40 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  // Split text for hero headline
  const headlineWords = "Secure Agreements for Digital Work".split(" ");

  return (
    <div className="relative min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] font-sans overflow-x-hidden text-zinc-900 dark:text-white selection:bg-orange-500/30">
      
      {/* Custom Cursor Glow (only visible on desktop, pointer-events-none) */}
      <motion.div 
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-orange-500/20 dark:bg-[#ff9157]/10 rounded-full blur-[100px] pointer-events-none z-0 hidden md:block"
        animate={{ x: mousePos.x - 200, y: mousePos.y - 200 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />

      {/* Particles Background */}
      {init && (
        <div className="absolute inset-0 z-0 pointer-events-none dark:opacity-100 opacity-40 mix-blend-multiply dark:mix-blend-screen">
          <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0" />
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/40 dark:bg-[#0e0e0e]/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-light.png" alt="Accord" className="h-11 dark:hidden" />
            <img src="/logo-dark.png" alt="Accord" className="h-11 hidden dark:block" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="p-2.5 rounded-full text-zinc-400 hover:text-orange-600 dark:text-neutral-500 dark:hover:text-[#ff9157] hover:bg-white/60 dark:hover:bg-zinc-800 transition-all border border-transparent dark:hover:border-zinc-700"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => connectWallet()}
              className="group relative px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 to-[#ff9157] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                {isConnecting ? 'Opening...' : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
            
            {/* The Floating '3D' Shield (CSS Layered Parallax) */}
            <motion.div 
              className="relative w-48 h-48 md:w-64 md:h-64 mb-12 flex items-center justify-center perspective-[1000px]"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-orange-400/30 to-orange-600/10 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-[0_0_80px_rgba(234,88,12,0.3)] dark:shadow-[0_0_100px_rgba(255,145,87,0.15)] flex items-center justify-center"
                style={{ rotateX: mousePos.y / 50 - 10, rotateY: mousePos.x / 50 - 10 }}
              >
                <div className="absolute inset-2 rounded-[2.5rem] bg-gradient-to-tl from-white/10 to-transparent border border-white/20" />
                <ShieldCheck className="w-24 h-24 md:w-32 md:h-32 text-orange-600 dark:text-[#ff9157] drop-shadow-[0_0_30px_rgba(234,88,12,0.8)] dark:drop-shadow-[0_0_30px_rgba(255,145,87,0.8)]" strokeWidth={1} />
              </motion.div>
            </motion.div>

            {/* Headline Details */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              <motion.div variants={itemVariants} className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-[#ff9157] text-[10px] font-black tracking-[0.3em] uppercase backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9157] animate-pulse" />
                  The Standard for Web3 Escrow
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8">
                {headlineWords.map((word, i) => (
                  <motion.span 
                    key={i} 
                    variants={itemVariants}
                    className="inline-block mr-3"
                  >
                    {word === "Digital" || word === "Work" ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-[#ff9157]">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </motion.span>
                ))}
              </h1>
              
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-zinc-500 dark:text-neutral-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Create a deal. Share a link. Get paid safely. <br className="hidden md:block" /> No middlemen. Fully onchain.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => connectWallet()}
                  disabled={isConnecting}
                  className="group relative w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-orange-600 to-[#ff9157] text-white font-bold text-lg overflow-hidden flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,88,12,0.4)] dark:shadow-[0_0_30px_rgba(255,145,87,0.3)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">{isConnecting ? 'Connecting...' : 'Launch App'}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24 relative z-10 border-y border-zinc-200/50 dark:border-white/5 bg-white/30 dark:bg-[#0e0e0e]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-200/50 dark:divide-white/5">
            {[
              { label: "Lost to Middlemen", prefix: "$", value: 0, suffix: "", format: (v) => v.toFixed(0) },
              { label: "Payment Delay", prefix: "", value: 0, suffix: "s", format: (v) => v.toFixed(0) },
              { label: "Decentralized", prefix: "", value: 100, suffix: "%", format: (v) => v.toFixed(0) }
            ].map((stat, i) => (
              <div key={i} className="pt-8 md:pt-0 flex flex-col items-center justify-center">
                <h3 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-neutral-500 mb-2">
                  {stat.prefix}
                  <Counter from={0} to={stat.value} duration={2 + i * 0.5} formattingFn={stat.format} />
                  {stat.suffix}
                </h3>
                <p className="text-sm font-bold text-orange-600 dark:text-[#ff9157] tracking-[0.2em] uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-24"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How Accord Works</h2>
              <div className="w-24 h-1.5 mx-auto rounded-full bg-gradient-to-r from-orange-600 to-[#ff9157] shadow-[0_0_15px_rgba(234,88,12,0.5)]" />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
              {/* Dotted connecting line (desktop) */}
              <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-zinc-300 dark:border-zinc-800 z-0" />

              {[
                { 
                  num: '01', 
                  title: 'Create Agreement', 
                  desc: 'Freelancer frames the terms and payment amount.', 
                  icon: <UserCheck className="w-10 h-10" /> 
                },
                { 
                  num: '02', 
                  title: 'Lock Payment', 
                  desc: 'Client deposits USDT into the smart contract escrow.', 
                  icon: <LockKeyhole className="w-10 h-10" /> 
                },
                { 
                  num: '03', 
                  title: 'Get Paid Safely', 
                  desc: 'Deliver work, client approves, instant payout.', 
                  icon: <Coins className="w-10 h-10" /> 
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 mb-8 rounded-[2rem] bg-white/60 dark:bg-[#1a1919]/80 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-white group-hover:scale-110 group-hover:-translate-y-4 group-hover:border-orange-500/50 group-hover:text-orange-600 dark:group-hover:text-[#ff9157] group-hover:shadow-[0_20px_40px_rgba(234,88,12,0.2)] dark:group-hover:shadow-[0_20px_40px_rgba(255,145,87,0.15)] transition-all duration-500">
                    {/* Orange Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white font-black text-xs flex items-center justify-center shadow-lg">
                      {step.num}
                    </div>
                    {/* Animated Icon Container */}
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {step.icon}
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                  <p className="text-zinc-500 dark:text-neutral-400 font-medium max-w-xs">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY ACCORD SECTION */}
        <section className="py-32 relative z-10 bg-zinc-50/50 dark:bg-[#111111]/30 border-y border-zinc-200/50 dark:border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-xl"
              >
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The Trustless Standard.</h2>
                <p className="text-xl text-zinc-500 dark:text-neutral-400 font-medium leading-relaxed mb-10">
                  We removed the middleman so you keep 100% of your earnings. Escrow ruled by code, not corporations.
                </p>
                <ul className="space-y-6">
                  {[
                    { title: "No Middleman", desc: "Smart contract holds funds not us. Nobody controls it.", icon: <Shield className="w-6 h-6" /> },
                    { title: "Instant Payment", desc: "Payment releases the moment client approves. 0 delay.", icon: <Zap className="w-6 h-6" /> },
                    { title: "File Protection", desc: "Watermarked preview shown first. Full file only after payment.", icon: <Lock className="w-6 h-6" /> }
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="group flex gap-5 items-start p-5 rounded-3xl bg-white/40 dark:bg-black/20 hover:bg-white dark:hover:bg-[#1a1919] hover:shadow-[0_10px_30px_rgba(234,88,12,0.05)] border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all duration-300 backdrop-blur-md"
                    >
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-[#ff9157] group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-black mb-1 group-hover:text-orange-600 dark:group-hover:text-[#ff9157] transition-colors">{item.title}</h4>
                        <p className="text-zinc-500 dark:text-neutral-400 font-medium">{item.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Injective Banner Feature */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative p-[1px] rounded-[3rem] bg-gradient-to-b from-zinc-200 to-zinc-100 dark:from-white/10 dark:to-transparent overflow-hidden group shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-600 to-[#ff9157] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                <div className="relative h-full bg-white dark:bg-[#0e0e0e] rounded-[2.8rem] p-10 md:p-14 flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-8 rounded-full bg-black flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <div className="w-10 h-10 border-[4px] border-[#00e6ed] rounded-full flex items-center justify-center border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <h3 className="text-3xl font-black mb-4">Built on Injective</h3>
                  <p className="text-zinc-500 dark:text-neutral-400 font-medium mb-8">
                    The fastest blockchain built for finance. Unmatched speed and decentralization.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                      <p className="text-2xl font-black text-zinc-900 dark:text-white">0.64s</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Block Time</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                      <p className="text-2xl font-black text-zinc-900 dark:text-white">$0.0002</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg Fee</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#050505] text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo-dark.png" alt="Accord" className="h-11" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Secure agreements for digital work, onchain.</h2>
          <p className="text-zinc-500 font-medium mb-10 max-w-sm">No trust required. Let smart contracts handle the escrow.</p>
          
          <div className="flex gap-6 mb-12">
            <a href="#" className="font-bold text-zinc-400 hover:text-white transition-colors">Twitter (X)</a>
            <a href="#" className="font-bold text-zinc-400 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="font-bold text-zinc-400 hover:text-white transition-colors">Documentation</a>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-sm font-bold text-zinc-600">
            <p>© 2026 Accord Escrow. All rights reserved.</p>
            <p className="mt-4 md:mt-0 flex items-center gap-2">Built on <span className="text-[#00e6ed]">Injective</span> ⚡</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
