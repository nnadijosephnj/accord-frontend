import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, Mail, Globe, ArrowRight, UserCheck, Info, Fingerprint, ShieldCheck, ExternalLink } from "lucide-react";

// Real Keplr logo SVG
const KeplrLogo = () => (
  <svg width="20" height="20" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="112" height="112" rx="28" fill="#1C1C2E"/>
    <path d="M56 20C36.12 20 20 36.12 20 56C20 75.88 36.12 92 56 92C75.88 92 92 75.88 92 56C92 36.12 75.88 20 56 20Z" fill="url(#kg)"/>
    <path d="M46 38L62 56L46 74" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M56 38V74" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.5"/>
    <defs>
      <linearGradient id="kg" x1="20" y1="20" x2="92" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="#726FFF"/>
        <stop offset="1" stopColor="#4B47D6"/>
      </linearGradient>
    </defs>
  </svg>
);

// Real MetaMask logo SVG
const MetaMaskLogo = () => (
  <svg width="20" height="20" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 176.3,103.4 174.6,164.6 230.8,162.1"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207.1,208.1"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="179.7,193.5 188,176.1 207.9,185.2"/>
    <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="138.3,262.3 180.3,262.3 179.5,253 139,253"/>
    <polygon fill="#763E1A" stroke="#763E1A" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 130.5,176.1 111.4,208.1 138.8,193.5"/>
    <polygon fill="#763E1A" stroke="#763E1A" strokeLinecap="round" strokeLinejoin="round" points="179.7,193.5 207.1,208.1 188,176.1 179.7,193.5"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="111.4,208.1 138.8,193.5 130.5,176.1"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="207.1,208.1 188,176.1 179.7,193.5"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 110.6,185.2 138.8,193.5 144.1,164.6"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 179.7,193.5 207.9,185.2 174.6,164.6"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 207.9,185.2 230.8,162.1"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 110.6,185.2 144.1,164.6"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 110.6,185.2 130.5,176.1 138.8,193.5"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 179.7,193.5 207.9,185.2"/>
  </svg>
);
import { useConnect } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { supabase, linkWalletToUser } from "../lib/supabaseHelpers";
import { useAuth } from "../context/AuthContext";

const flowVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
};

export default function IntegratedAuthModal({ isOpen, onClose, onComplete, forceStep = null }) {
  const { user, session, closeAuthModal } = useAuth();
  const { connect } = useConnect();
  
  // FLOW STEPS: 'CHOICE' | 'EMAIL_OTP' | 'WALLET_PROMPT' | 'OWNERSHIP_INFO'
  const [step, setStep] = useState(() => forceStep || "CHOICE");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const next = (s) => { setDirection(1); setStep(s); };
  const back = (s) => { setDirection(-1); setStep(s); };

  // ── Auth Handlers ──────────────────────────────────────────

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  const handleEmailStart = async () => {
    if (!email) return setError("Enter email");
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else next("EMAIL_OTP");
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) setError(error.message);
    // Success: session will update and Dashboard will catch it
    setIsLoading(false);
  };

  const handleConnectWallet = async (walletId) => {
    setIsLoading(true);
    setError(null);

    // Check extension availability before attempting connection
    if (walletId === "app.keplr" && !window.keplr) {
      setError("Keplr extension not found. Please install it from keplr.app and refresh.");
      setIsLoading(false);
      return;
    }
    if (walletId === "io.metamask" && !window.ethereum?.isMetaMask) {
      setError("MetaMask extension not found. Please install it from metamask.io and refresh.");
      setIsLoading(false);
      return;
    }

    try {
      const account = await connect(async () => {
        const wallet = createWallet(walletId);
        await wallet.connect({ client, chain: injectiveTestnet });
        return wallet;
      });
      
      if (account && user) {
        await linkWalletToUser(user.id, { 
          walletAddress: account.address, 
          walletType: 'external' 
        });
      }
      if (onComplete) onComplete();
      else closeAuthModal();
    } catch (err) {
      console.error("Wallet connect error:", err);
      setError(err?.message || "Failed to connect. Please try again.");
    }
    setIsLoading(false);
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const strategy = session?.app_metadata?.provider === 'google' ? 'google' : 'email';
      const wallet = inAppWallet();
      const account = await connect(wallet, { 
        client, 
        chain: injectiveTestnet,
        strategy,
        email: session?.user?.email 
      });

      if (account && user) {
        await linkWalletToUser(user.id, { 
          walletAddress: account.address, 
          walletType: 'generated' 
        });
      }
      if (onComplete) onComplete();
      else closeAuthModal();
      window.location.reload();
    } catch {
      setError("Wallet generation failed. Try again.");
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-20"><X size={20} /></button>

        <div className="p-10 flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            {step === "CHOICE" && (
              <Motion.div key="choice" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Globe className="text-orange-500 w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Sign In</h2>
                   <p className="text-zinc-500 text-sm">Welcome back to Accord</p>
                </div>

                <div className="space-y-3">
                  <button onClick={handleGoogleLogin} className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                    Google
                  </button>

                  <div className="flex gap-2">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)} className="flex-grow bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50" />
                    <button onClick={handleEmailStart} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"><ArrowRight size={20} /></button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase text-zinc-600 tracking-widest bg-[#0a0a0a] px-4">OR WALLET</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleConnectWallet("app.keplr")} disabled={isLoading} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#726FFF]/10 hover:border-[#726FFF]/40 text-white font-bold transition-all disabled:opacity-50">
                      <KeplrLogo /> Keplr
                    </button>
                    <button onClick={() => handleConnectWallet("io.metamask")} disabled={isLoading} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/10 hover:border-orange-500/40 text-white font-bold transition-all disabled:opacity-50">
                      <MetaMaskLogo /> MetaMask
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}

            {step === "EMAIL_OTP" && (
              <Motion.div key="otp" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                <div className="text-center">
                   <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="text-orange-500 w-8 h-8" /></div>
                   <h2 className="text-xl font-black text-white italic uppercase">Verify</h2>
                   <p className="text-zinc-500 text-sm italic">Sent to {email}</p>
                </div>
                <input type="text" placeholder="000000" value={otp} onChange={(e)=>setOtp(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-6 text-center text-3xl font-black text-white focus:outline-none" />
                <button onClick={handleVerifyOtp} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl uppercase transition-all italic">Verify Code</button>
              </Motion.div>
            )}

            {step === "WALLET_PROMPT" && (
              <Motion.div key="prompt" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                <div className="text-center">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><UserCheck className="text-emerald-500 w-8 h-8" /></div>
                   <h2 className="text-xl font-black text-white italic uppercase">Identity Verified</h2>
                   <p className="text-zinc-500 text-sm">Choose how to secure your funds</p>
                </div>

                <div className="grid gap-3">
                   <button onClick={() => next("OWNERSHIP_INFO")} className="w-full p-6 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-2xl text-left group transition-all">
                      <h4 className="font-black text-white uppercase italic text-sm mb-1">Create Wallet for me</h4>
                      <p className="text-zinc-500 text-[10px]">Securely generated by Thirdweb. Perfect for beginners.</p>
                   </button>
                   <div className="p-4 border border-white/5 rounded-2xl grid grid-cols-2 gap-2">
                       <button onClick={() => handleConnectWallet("app.keplr")} disabled={isLoading} className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"><KeplrLogo /> Keplr</button>
                       <button onClick={() => handleConnectWallet("io.metamask")} disabled={isLoading} className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"><MetaMaskLogo /> MetaMask</button>
                   </div>
                </div>

                <button onClick={() => closeAuthModal()} className="w-full text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Skip for now</button>
              </Motion.div>
            )}

            {step === "OWNERSHIP_INFO" && (
              <Motion.div key="info" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Info className="text-blue-500 w-8 h-8" /></div>
                   <h2 className="text-xl font-black text-white italic uppercase">Ownership Info</h2>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl space-y-4 italic text-zinc-400 text-xs">
                   <div className="flex gap-3"><Fingerprint className="text-orange-500 shrink-0" size={18}/><p><b>Self-Custody:</b> Accord does not own your keys. Your wallet is yours.</p></div>
                   <div className="flex gap-3"><ShieldCheck className="text-emerald-500 shrink-0" size={18}/><p><b>Secure Recovery:</b> Export your recovery phrase anytime from settings.</p></div>
                   <div className="flex gap-3"><ExternalLink className="text-blue-500 shrink-0" size={18}/><p><b>Full Portability:</b> Your wallet works across the Injective network.</p></div>
                </div>
                <button onClick={handleCreateWallet} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl uppercase transition-all italic">{isLoading ? 'Loading...' : 'Create My Wallet'}</button>
                <button onClick={() => back("WALLET_PROMPT")} className="w-full text-zinc-600 text-[10px] font-bold uppercase">Go Back</button>
              </Motion.div>
            )}
          </AnimatePresence>
          {error && <p className="mt-4 text-[10px] text-red-500 uppercase font-black text-center">{error}</p>}
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest">
            Accord Trust Execution Framework v2.0
          </p>
        </div>
      </Motion.div>
    </div>
  );
}
