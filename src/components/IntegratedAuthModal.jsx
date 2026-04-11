import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Mail, Smartphone, Globe, ArrowRight, Wallet, Info, Fingerprint, ExternalLink, Zap, UserCheck, Shield, ShieldCheck } from "lucide-react";
import { useConnect } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { supabase, linkWalletToUser } from "../lib/supabaseHelpers";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";

const flowVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
};

export default function IntegratedAuthModal({ isOpen, onClose, onComplete, forceStep = null }) {
  const { address } = useWallet();
  const { session, user, isGuest } = useAuth();
  const { connect } = useConnect();
  
  // FLOW STEPS: 'CHOICE' | 'EMAIL_OTP' | 'WALLET_PROMPT' | 'OWNERSHIP_INFO'
  const [step, setStep] = useState(forceStep || "CHOICE");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const next = (newStep) => {
    setDirection(1);
    setStep(newStep);
  };

  const back = (newStep) => {
    setDirection(-1);
    setStep(newStep);
  };

  // If user is already logged into Supabase but no wallet (Guest Mode), and they just opened the modal, show them the prompt
  useEffect(() => {
    if (session && !user?.wallet_address && step === "CHOICE") {
      setStep("WALLET_PROMPT");
    }
  }, [session, user, step]);

  if (!isOpen) return null;

  // ── Step 1: Main Choice ──────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Use the explicit origin, ensuring no trailing slashes or weirdness
    const redirectUrl = window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  const handleEmailOtpStart = async () => {
    if (!email) return setError("Enter email");
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      next("EMAIL_OTP");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) {
      setError(error.message);
    } else {
      // AuthContext will pick up the session and move us to WALLET_PROMPT via the useEffect above
    }
    setIsLoading(false);
  };

  const handleConnectWallet = async (walletId) => {
    setIsLoading(true);
    try {
      const wallet = createWallet(walletId);
      const account = await connect(wallet, { client, chain: injectiveTestnet });
      
      // If we are in Guest Mode, link this new wallet to the existing account
      if (account && user) {
        await linkWalletToUser(user.id, { 
          walletAddress: account.address, 
          walletType: 'external' 
        });
      }
      
      onComplete();
    } catch (e) {
      setError("Failed to connect wallet. Is it installed?");
    }
    setIsLoading(false);
  };

  // ── Step 3: Wallet Decisions ──────────────────────────────────
  const handleAutoCreateWallet = async () => {
    setIsLoading(true);
    try {
      const wallet = inAppWallet();
      // Use the email trapped from session
      const strategy = session?.app_metadata?.provider === 'google' ? 'google' : 'email';
      
      await connect(wallet, { 
        client, 
        chain: injectiveTestnet, 
        strategy, 
        email: session?.user?.email 
      });

      // After Thirdweb creates it, link it to our Supabase user
      const account = wallet.getAccount();
      if (account && user) {
        await linkWalletToUser(user.id, { 
          walletAddress: account.address, 
          walletType: 'generated' 
        });
      }
      onComplete();
    } catch (e) {
      setError("Failed to create wallet: " + e.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }} 
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl min-h-[500px] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 z-10 transition-colors">
          <X size={20} />
        </button>

        <div className="p-10 flex-grow flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {step === "CHOICE" && (
              <motion.div key="choice" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center mb-8 pt-4">
                   <div className="w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                     <Globe className="text-orange-500 w-8 h-8" />
                   </div>
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Join Accord</h2>
                   <p className="text-zinc-500 text-sm mt-2">Login with your preference below</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleGoogleLogin} 
                    className="w-full py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                    Continue with Google
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase text-zinc-600 tracking-widest bg-[#0a0a0a] px-4">OR USE EMAIL</div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50"
                    />
                    <button 
                      onClick={handleEmailOtpStart}
                      className="p-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all shadow-lg shadow-orange-600/20"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center mb-4">Direct Wallet Connection</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleConnectWallet("app.keplr")} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                      <Smartphone size={18} className="text-blue-400" /> Keplr
                    </button>
                    <button onClick={() => handleConnectWallet("io.metamask")} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                      <Zap size={18} className="text-orange-400" /> MetaMask
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "EMAIL_OTP" && (
              <motion.div key="otp" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-8 py-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="text-orange-500 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic">Verify Email</h2>
                  <p className="text-zinc-500 text-sm mt-2">Enter the code sent to <b>{email}</b></p>
                </div>

                <input 
                  type="text" 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-orange-500/50"
                />

                <button 
                  onClick={handleVerifyOtp}
                  className="w-full py-5 px-6 rounded-2xl bg-orange-600 text-white font-black text-lg hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/30 uppercase italic"
                >
                  Verify Code
                </button>
                
                <button onClick={() => back("CHOICE")} className="w-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                  Use different method
                </button>
              </motion.div>
            )}

            {step === "WALLET_PROMPT" && (
              <motion.div key="prompt" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-8 py-4">
                <div className="text-center mb-10">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <UserCheck className="text-emerald-500 w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Identity Verified</h2>
                   <p className="text-zinc-500 text-sm mt-2">Now, how do you want to secure your funds?</p>
                </div>

                <div className="grid gap-4">
                   {/* Option A */}
                   <button 
                    onClick={() => next("OWNERSHIP_INFO")}
                    className="group flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/[0.08] transition-all text-left"
                   >
                     <div className="w-12 h-12 shrink-0 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                       <Zap size={24} />
                     </div>
                     <div>
                       <h4 className="font-black text-white uppercase italic text-lg leading-none mb-2">Auto-Create Wallet</h4>
                       <p className="text-zinc-500 text-xs font-medium leading-relaxed">Perfect for beginners. We generate a secure wallet for you in 5 seconds.</p>
                     </div>
                   </button>

                   {/* Option B */}
                   <div className="p-6 rounded-3xl bg-black border border-white/5 space-y-4">
                     <div>
                        <h4 className="font-black text-white uppercase italic text-xs tracking-widest text-zinc-600 mb-4">Or Connect Own</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleConnectWallet("app.keplr")} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all">
                            <Smartphone size={16} className="text-blue-400" /> Keplr
                          </button>
                          <button onClick={() => handleConnectWallet("io.metamask")} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all">
                            <Zap size={16} className="text-orange-400" /> MetaMask
                          </button>
                        </div>
                     </div>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    // Close and enter Guest Mode (Path handled by AuthContext sync)
                    onComplete(); 
                  }}
                  className="w-full py-4 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                >
                  Skip for now (Guest Mode)
                </button>
              </motion.div>
            )}

            {step === "OWNERSHIP_INFO" && (
              <motion.div key="ownership" custom={direction} variants={flowVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Info className="text-blue-500 w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic uppercase">Wallet Ownership</h2>
                   <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest">Read carefully before proceeding</p>
                </div>

                <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5 italic">
                  <div className="flex gap-4">
                    <Fingerprint className="text-orange-500 shrink-0" size={20} />
                    <p className="text-xs text-zinc-400 leading-relaxed"><b className="text-white uppercase">Self-Custody:</b> Accord does not own your keys. Your wallet is secured by your social identity.</p>
                  </div>
                  <div className="flex gap-4">
                    <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                    <p className="text-xs text-zinc-400 leading-relaxed"><b className="text-white uppercase">Safe Backup:</b> You can export your recovery phrase anytime from settings.</p>
                  </div>
                  <div className="flex gap-4">
                    <ExternalLink className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-zinc-400 leading-relaxed"><b className="text-white uppercase">Portable:</b> This wallet works on any EVM chain via the Injective network.</p>
                  </div>
                </div>

                <button 
                  onClick={handleAutoCreateWallet}
                  className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-lg hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all uppercase italic flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Creating...' : 'Create My Wallet'} <ArrowRight size={20} />
                </button>

                <button onClick={() => back("WALLET_PROMPT")} className="w-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                  Go Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}
        </div>

        <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center flex items-center justify-center gap-2">
          <Shield className="w-3 h-3 text-zinc-800" />
          <p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest">
            Accord Trust Execution Framework v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
