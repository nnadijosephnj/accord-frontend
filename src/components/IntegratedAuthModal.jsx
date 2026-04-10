import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Loader2, Link as LinkIcon, ShieldAlert, UserCheck, Zap, Lock, CheckCircle2 } from "lucide-react";
import { useConnect, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { upsertUser } from "../lib/supabaseHelpers";

export default function IntegratedAuthModal({ isOpen, onClose, onComplete, initialStep = 1 }) {
  const { connect } = useConnect();
  const [step, setStep] = useState(initialStep); // 1: Login/Identity, 2: Choice, 3: External, 4: Auto-Info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialEmail, setSocialEmail] = useState("");
  const [tempWallet, setTempWallet] = useState(null);

  if (!isOpen) return null;

  // Manual Google Login (Identity Only)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const wallet = inAppWallet();
      // We authenticate to get the identity, but we don't connect yet!
      const account = await wallet.connect({
        client,
        strategy: "google",
        chain: injectiveTestnet,
      });
      
      const profiles = await wallet.getProfiles();
      const email = profiles?.[0]?.details?.email;
      
      if (email) {
        setSocialEmail(email);
        setTempWallet(wallet);
        setStep(2); // Show choice screen
      } else {
        onComplete();
      }
    } catch (err) {
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExternalWallet = async (walletId) => {
    setLoading(true);
    setError("");
    try {
      const wallet = createWallet(walletId);
      const account = await connect(async () => {
         await wallet.connect({ client, chain: injectiveTestnet });
         return wallet;
      });
      
      await upsertUser({
        walletAddress: account.address,
        email: socialEmail || null,
        loginMethod: "wallet",
        walletType: "external",
      });
      onComplete();
    } catch (err) {
      setError("Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeAutoCreate = async () => {
    setLoading(true);
    try {
      const address = tempWallet.getAccount().address;
      await upsertUser({
        walletAddress: address,
        email: socialEmail,
        loginMethod: "google",
        walletType: "generated",
      });
      onComplete();
    } catch (err) {
      setError("Failed to activate wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleGhostMode = async () => {
    setLoading(true);
    try {
      await upsertUser({
        walletAddress: `ghost_${socialEmail}`,
        email: socialEmail,
        loginMethod: "google",
        walletType: "ghost",
      });
      onComplete();
    } catch (err) {
      setError("Failed to enter as guest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
          <button onClick={() => step === 2 ? handleGhostMode() : onClose()} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 z-10"><X size={20} /></button>

          <div className="p-10 pt-14">
            <div className="w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center mb-8">
              {step === 1 ? <UserCheck className="text-orange-500 w-8 h-8" /> : <ShieldAlert className="text-orange-500 w-8 h-8" />}
            </div>

            {/* Step 1: Professional Main Entry */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Join Accord</h2>
                  <p className="text-zinc-500 font-medium">Capture your on-chain identity.</p>
                </div>

                <div className="space-y-3">
                  <button onClick={() => handleExternalWallet('app.keplr')} className="w-full flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
                    <img src="https://www.keplr.app/favicon.ico" className="w-6 h-6 rounded-md" alt="Keplr" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">Connect Keplr</span>
                  </button>
                  <button onClick={() => handleExternalWallet('io.metamask')} className="w-full flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
                    <img src="https://metamask.io/favicon.ico" className="w-6 h-6 rounded-md" alt="MetaMask" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">Connect MetaMask</span>
                  </button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-600"><span className="bg-[#0a0a0a] px-4">Social Entry</span></div>
                  </div>

                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-white text-black font-black hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />}
                    Continue with Google
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: The Choice screen */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Wallet Required</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                      Identity verified: <span className="text-white font-bold">{socialEmail}</span>. <br />
                      To sign agreements, you need a wallet.
                  </p>
                </div>

                <div className="grid gap-3">
                  <button onClick={() => setStep(3)} className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500 transition-all group">
                     <span className="font-bold text-white uppercase tracking-wide text-xs">Link My Keplr Wallet</span>
                     <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setStep(4)} className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500 transition-all group">
                     <span className="font-bold text-white uppercase tracking-wide text-xs">Auto-Create With Accord</span>
                     <ArrowRight size={18} />
                  </button>
                  <button onClick={handleGhostMode} className="w-full py-4 text-zinc-600 hover:text-white font-bold uppercase tracking-widest text-[10px]">Skip for now (Ghost Mode)</button>
                </div>
              </div>
            )}

            {/* Step 3: Path B External Linking */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-white uppercase italic text-center">Link Professional Wallet</h2>
                <div className="grid gap-3">
                  <button onClick={() => handleExternalWallet('app.keplr')} className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500 text-white font-bold uppercase text-xs">Link Keplr</button>
                  <button onClick={() => handleExternalWallet('io.metamask')} className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500 text-white font-bold uppercase text-xs">Link MetaMask</button>
                </div>
                <button onClick={() => setStep(2)} className="w-full text-zinc-600 font-bold text-[10px] uppercase text-center">← Back</button>
              </div>
            )}

            {/* Step 4: Auto-Create Info */}
            {step === 4 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-white uppercase italic text-center">Activate Instant Wallet</h2>
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex gap-4"><CheckCircle2 className="text-green-500 flex-shrink-0" size={20} /><p className="text-[10px] text-zinc-300 uppercase font-bold tracking-tight">Non-custodial. You own the keys.</p></div>
                  <div className="flex gap-4"><CheckCircle2 className="text-green-500 flex-shrink-0" size={20} /><p className="text-[10px] text-zinc-300 uppercase font-bold tracking-tight">Reconstruct anytime via Google.</p></div>
                </div>
                <button onClick={finalizeAutoCreate} className="w-full py-5 rounded-[2rem] bg-orange-600 text-white font-black hover:bg-orange-500 transition-all uppercase tracking-widest text-xs">Confirm & Activate</button>
                <button onClick={() => setStep(2)} className="w-full text-zinc-600 font-bold text-[10px] uppercase text-center">← Back</button>
              </div>
            )}

            {error && <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center">{error}</div>}
          </div>
          <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center"><p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest">Accord Trust Execution Framework</p></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
