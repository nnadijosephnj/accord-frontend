import React, { useEffect, useState, useRef } from 'react';
import { motion as Motion, useInView, animate } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { ShieldCheck, LockKeyhole, Coins, ArrowRight, UserCheck, Moon, Sun, Shield, Zap, Lock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
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
  const { address, openAuthModal, isConnecting } = useWallet();
  const { isGuest } = useAuth();
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
    if (address || isGuest) {
      navigate('/dashboard');
    }
  }, [address, isGuest, navigate]);

  const handleLoginStart = () => {
    openAuthModal('CHOICE');
  };

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        resize: true,
      },
      modes: {
        grab: { distance: 200, links: { opacity: 0.8 } },
      },
    },
    particles: {
      color: { value: "#ea580c" },
      links: {
        color: "#ea580c",
        distance: 180,
        enable: true,
        opacity: 0.3,
        width: 1.5,
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: false,
        straight: false,
        outModes: { default: "bounce" },
      },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 2, max: 4 } },
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
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const headlineWords = "Secure Agreements for Digital Work".split(" ");

  return (
    <div className="relative min-h-screen bg-[#f5f6f7] dark:bg-[#0e0e0e] font-sans overflow-x-hidden text-zinc-900 dark:text-white selection:bg-orange-500/30">
      
      {/* Background GRID PATTERN for Premium Web3 feel */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      {/* Custom Cursor Glow */}
      <Motion.div 
        className="fixed top-0 left-0 w-[500px] h-[500px] bg-orange-500/30 dark:bg-[#ff9157]/15 rounded-full blur-[120px] pointer-events-none z-0 hidden lg:block"
        animate={{ x: mousePos.x - 250, y: mousePos.y - 250 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />

      {/* Particles Background Layer */}
      {init && (
        <div className="absolute inset-0 z-0 pointer-events-none dark:opacity-100 opacity-60 mix-blend-multiply dark:mix-blend-screen">
          <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0" />
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/20 dark:bg-[#0e0e0e]/50 backdrop-blur-2xl border-b border-orange-500/10 dark:border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-light.png" alt="Accord" className="h-11 dark:hidden drop-shadow-sm" />
            <img src="/logo-dark.png" alt="Accord" className="h-11 hidden dark:block drop-shadow-md" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="p-3 rounded-full text-zinc-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-[#ff9157] bg-white/40 hover:bg-white/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-orange-500/10 dark:border-white/5 shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
               onClick={handleLoginStart}
               className="group relative px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black overflow-hidden shadow-lg hover:shadow-orange-500/20 transition-all"
             >
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 to-[#ff9157] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                 {isConnecting ? 'Opening...' : 'Sign In'}
               </span>
             </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION WITH SPLINE 3D VIEWER */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
          
          {/* HUGE 3D SPLINE EMBED BACKGROUND */}
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-80 mix-blend-luminosity dark:mix-blend-normal pointer-events-auto">
             <spline-viewer url="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"></spline-viewer>
          </div>

          <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10 pointer-events-none mt-20">
            {/* Headline Details */}
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-5xl mix-blend-normal backdrop-blur-[2px] rounded-[3rem] p-4"
            >
              <Motion.div variants={itemVariants} className="mb-8 flex justify-center">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 dark:bg-orange-500/10 border border-white/20 dark:border-orange-500/20 text-white dark:text-[#ff9157] text-xs font-black tracking-[0.3em] uppercase backdrop-blur-md shadow-2xl">
                  <span className="w-2 h-2 rounded-full bg-[#ff9157] animate-pulse shadow-[0_0_10px_#ff9157]" />
                  The Standard for Web3 Escrow
                </span>
              </Motion.div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.95] mb-10 drop-shadow-2xl">
                {headlineWords.map((word, i) => (
                  <Motion.span 
                    key={i} 
                    variants={itemVariants}
                    className="inline-block mr-3 md:mr-5"
                  >
                    {word === "Digital" || word === "Work" ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-600 to-[#ff9157] drop-shadow-[0_0_20px_rgba(234,88,12,0.3)]">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </Motion.span>
                ))}
              </h1>
              
              <Motion.p variants={itemVariants} className="text-2xl md:text-3xl text-zinc-700 dark:text-neutral-300 font-bold mb-14 max-w-3xl mx-auto leading-relaxed drop-shadow-lg p-2">
                Create a deal. Share a link. Get paid safely. <br className="hidden md:block" /> Onchain. Unstoppable. Trustless.
              </Motion.p>
              
              <Motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto">
                <button
                  onClick={handleLoginStart}
                  disabled={isConnecting}
                  className="group relative w-full sm:w-auto px-12 py-6 rounded-full bg-gradient-to-r from-orange-600 to-[#ff9157] text-white font-black text-xl overflow-hidden flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(234,88,12,0.5)] dark:shadow-[0_0_60px_rgba(255,145,87,0.4)] hover:shadow-[0_0_80px_rgba(234,88,12,0.8)] hover:-translate-y-2 hover:scale-105 transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 tracking-wide">{isConnecting ? 'Signing In...' : 'Sign In'}</span>
                  <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </button>
              </Motion.div>
            </Motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-40 relative z-10 bg-white/40 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border-y border-orange-500/10 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <Motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-32"
            >
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg">How Accord Works</h2>
              <div className="w-32 h-2 mx-auto rounded-full bg-gradient-to-r from-orange-600 to-[#ff9157] shadow-[0_0_20px_rgba(234,88,12,0.8)]" />
            </Motion.div>

            <div className="grid lg:grid-cols-3 gap-16 relative">
              {/* Dotted connecting line (desktop) */}
              <div className="hidden lg:block absolute top-[64px] left-[15%] right-[15%] h-1 border-t-4 border-dashed border-orange-500/30 z-0" />

              {[
                { 
                  num: '01', 
                  title: 'Create Agreement', 
                  desc: 'Freelancer frames the terms and payment amount inside an immutable block.', 
                  icon: <UserCheck className="w-14 h-14" /> 
                },
                { 
                  num: '02', 
                  title: 'Lock Payment', 
                  desc: 'Client deposits USDT into the smart contract escrow. Funds are cryptographically secured.', 
                  icon: <LockKeyhole className="w-14 h-14" /> 
                },
                { 
                  num: '03', 
                  title: 'Get Paid Safely', 
                  desc: 'Deliver work, client approves, and instant payout routes directly to your wallet.', 
                  icon: <Coins className="w-14 h-14" /> 
                }
              ].map((step, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-32 h-32 mb-10 rounded-[2.5rem] bg-white/80 dark:bg-[#1a1919]/90 backdrop-blur-2xl border-2 border-white/50 dark:border-white/10 shadow-2xl shadow-orange-500/10 flex items-center justify-center text-zinc-900 dark:text-white group-hover:scale-110 group-hover:-translate-y-6 group-hover:border-orange-500 group-hover:text-orange-600 dark:group-hover:text-[#ff9157] group-hover:shadow-[0_30px_60px_rgba(234,88,12,0.3)] dark:group-hover:shadow-[0_30px_60px_rgba(255,145,87,0.25)] transition-all duration-500">
                    <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 text-white font-black text-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.6)]">
                      {step.num}
                    </div>
                    <Motion.div 
                      animate={{ y: [0, -8, 0] }} 
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                    >
                      {step.icon}
                    </Motion.div>
                  </div>
                  <h3 className="text-3xl font-black mb-4">{step.title}</h3>
                  <p className="text-xl text-zinc-600 dark:text-neutral-400 font-medium max-w-sm leading-relaxed">{step.desc}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-32 relative z-10 border-y border-orange-500/20 dark:border-white/5 bg-gradient-to-b from-white/10 to-transparent dark:bg-black/40 backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-orange-500/20 blur-[150px] -z-10 rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-300 dark:divide-white/10">
            {[
              { label: "Lost to Middlemen", prefix: "$", value: 0, suffix: "", format: (v) => v.toFixed(0) },
              { label: "Payment Delay", prefix: "", value: 0, suffix: "s", format: (v) => v.toFixed(0) },
              { label: "Decentralized", prefix: "", value: 100, suffix: "%", format: (v) => v.toFixed(0) }
            ].map((stat, i) => (
              <div key={i} className="pt-10 md:pt-0 flex flex-col items-center justify-center">
                <h3 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-neutral-500 mb-4 drop-shadow-xl">
                  {stat.prefix}
                  <Counter from={0} to={stat.value} duration={2.5 + i * 0.5} formattingFn={stat.format} />
                  {stat.suffix}
                </h3>
                <p className="text-lg font-black text-orange-600 dark:text-[#ff9157] tracking-[0.3em] uppercase drop-shadow-md">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY ACCORD SECTION */}
        <section className="py-40 relative z-10 bg-zinc-100 dark:bg-[#0e0e0e]/80 border-y border-zinc-200/50 dark:border-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <Motion.div 
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-xl"
              >
                <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight drop-shadow-md">The Trustless Standard.</h2>
                <p className="text-2xl text-zinc-600 dark:text-neutral-400 font-semibold leading-relaxed mb-14">
                  We removed the middleman so you keep 100% of your earnings. Escrow governed strictly by immutable code, not corporations.
                </p>
                <ul className="space-y-8">
                  {[
                    { title: "No Middleman", desc: "Smart contracts hold funds, not us. Nobody can arbitrarily freeze or control your money.", icon: <Shield className="w-8 h-8" /> },
                    { title: "Instant Payment", desc: "Payout releases the exact millisecond the client hits approve. Pure zero-delay processing.", icon: <Zap className="w-8 h-8" /> },
                    { title: "File Protection", desc: "Watermarked preview shown first. The final full asset unlocks only after payment hits.", icon: <Lock className="w-8 h-8" /> }
                  ].map((item, i) => (
                    <Motion.li 
                      key={i}
                      whileHover={{ x: 15, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group flex gap-6 items-start p-6 rounded-[2rem] bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-[#1a1919] hover:shadow-[0_20px_40px_rgba(234,88,12,0.1)] dark:hover:shadow-[0_20px_40px_rgba(255,145,87,0.1)] border border-transparent hover:border-orange-500/30 dark:hover:border-white/10 transition-all duration-300 backdrop-blur-xl"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-[#ff9157] group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300 shadow-inner">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black mb-2 group-hover:text-orange-600 dark:group-hover:text-[#ff9157] transition-colors">{item.title}</h4>
                        <p className="text-lg text-zinc-600 dark:text-neutral-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </Motion.li>
                  ))}
                </ul>
              </Motion.div>

              {/* Injective Banner Feature */}
              <Motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative p-[2px] rounded-[3.5rem] bg-gradient-to-br from-zinc-300 to-zinc-100 dark:from-white/20 dark:to-transparent overflow-hidden group shadow-2xl perspective-[1000px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-600 to-[#00e6ed] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl" />
                <div className="relative h-full bg-white dark:bg-[#0a0a0a] rounded-[3.4rem] p-12 md:p-16 flex flex-col items-center text-center">
                  <div className="w-28 h-28 mb-10 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(0,230,237,0.3)] transition-shadow duration-700">
                    <div className="w-16 h-16 border-[6px] border-[#00e6ed] rounded-full flex items-center justify-center border-t-transparent animate-spin" style={{ animationDuration: '2s' }} />
                  </div>
                  <h3 className="text-4xl font-black mb-6 drop-shadow-md">Built on Injective</h3>
                  <p className="text-xl text-zinc-500 dark:text-neutral-400 font-semibold mb-12 leading-relaxed">
                    The fastest blockchain built exclusively for Web3 finance. Unmatched execution speed and pure decentralization.
                  </p>
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:border-[#00e6ed]/30 transition-colors duration-500">
                      <p className="text-4xl font-black text-zinc-900 dark:text-white mb-2">0.64s</p>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Block Time</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:border-[#00e6ed]/30 transition-colors duration-500">
                      <p className="text-4xl font-black text-zinc-900 dark:text-white mb-2">$0.0002</p>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Avg Fee</p>
                    </div>
                  </div>
                </div>
              </Motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#050505] text-white py-20 border-t border-orange-500/20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-10 drop-shadow-xl">
            <img src="/logo-dark.png" alt="Accord" className="h-11" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Secure agreements for digital work, onchain.</h2>
          <p className="text-lg text-zinc-500 font-bold mb-14 max-w-md leading-relaxed">No trust required. Let smart contracts mathematically handle your escrow.</p>
          
          <div className="flex gap-10 mb-16">
            <a href="#" className="font-black text-xs uppercase tracking-widest text-zinc-400 hover:text-orange-500 transition-colors">Twitter (X)</a>
            <a href="#" className="font-black text-xs uppercase tracking-widest text-zinc-400 hover:text-orange-500 transition-colors">GitHub</a>
            <a href="#" className="font-black text-xs uppercase tracking-widest text-zinc-400 hover:text-orange-500 transition-colors">Docs</a>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10 text-sm font-black text-zinc-600 uppercase tracking-widest">
            <p>© 2026 Accord Escrow. All rights reserved.</p>
            <p className="mt-6 md:mt-0 flex items-center gap-2">Built on <span className="text-[#00e6ed] drop-shadow-[0_0_10px_#00e6ed]">Injective</span> ⚡</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
