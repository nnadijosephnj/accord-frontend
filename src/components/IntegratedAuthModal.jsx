import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Loader2, Link as LinkIcon, ShieldAlert, UserCheck, Zap, Lock, CheckCircle2 } from "lucide-react";
import { useConnect, useActiveAccount, ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { upsertUser } from "../lib/supabaseHelpers";

export default function IntegratedAuthModal({ isOpen, onClose, onComplete, initialStep = 1 }) {
  const activeAccount = useActiveAccount();
  const [step, setStep] = useState(initialStep); // 1: Login/Identity, 2: Choice, 3: External, 4: Auto-Info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialEmail, setSocialEmail] = useState("");
  const [tempWallet, setTempWallet] = useState(null);

  if (!isOpen) return null;

  // Step 1: Captured identity after Google/Email login
  const onSocialLoginComplete = async (wallet) => {
    try {
      setLoading(true);
      const profiles = await wallet.getProfiles();
      const email = profiles?.[0]?.details?.email;
      
      if (email) {
        setSocialEmail(email);
        setTempWallet(wallet);
        setStep(2); // Show the Choice screen
      } else {
        // If somehow email is missing, we try to move forward as guest
        onComplete();
      }
    } catch (err) {
      setError("Identity authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2-4: Finalize the account based on choice
  const finalizeOnboarding = async (walletAddress, walletType) => {
    setLoading(true);
    try {
      await upsertUser({
        walletAddress: walletAddress || `ghost_${socialEmail}`,
        email: socialEmail,
        loginMethod: "google",
        walletType: walletType, // 'external' | 'generated' | 'ghost'
      });
      onComplete();
    } catch (err) {
      setError("Failed to link wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice) => {
    if (choice === 'external') setStep(3);
    else if (choice === 'auto') setStep(4);
    else finalizeOnboarding(null, 'ghost');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Close / X Button */}
          <button 
              onClick={() => step === 2 ? handleChoice('ghost') : onClose()} 
              className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all z-10"
          >
            <X size={20} />
          </button>

          <div className="p-10 pt-14">
            {/* Header Icon */}
            <div className="w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center mb-8">
              {step === 1 ? <UserCheck className="text-orange-500 w-8 h-8" /> : <ShieldAlert className="text-orange-500 w-8 h-8" />}
            </div>

            {/* Step 1: Identity First */}
            {step === 1 && (
              <div className="space-y-8 text-center sm:text-left">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Join Accord</h2>
                  <p className="text-zinc-500 font-medium">Identify with Google to secure your identity.</p>
                </div>
                <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5 p-1">
                  <ConnectEmbed
                    client={client}
                    chain={injectiveTestnet}
                    wallets={[inAppWallet({ auth: { options: ["google", "email"] } })]}
                    theme={"dark"}
                    onConnect={onSocialLoginComplete}
                    className="!bg-transparent !border-0"
                  />
                </div>
              </div>
            )}

            {/* Step 2: The Choice */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase italic">Wallet Required</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                      Hey <span className="text-white font-bold">{socialEmail.split('@')[0]}</span>, your identity is verified. 
                      You need a wallet to handle payments.
                  </p>
                </div>

                <div className="grid gap-3">
                  <button onClick={() => handleChoice('external')} className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 hover:-translate-y-1 transition-all group text-left">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 transition-all">
                        <LinkIcon size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Connect External</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Keplr / MetaMask</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-zinc-700 group-hover:text-white" />
                  </button>

                  <button onClick={() => handleChoice('auto')} className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-1 transition-all group text-left">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 transition-all">
                        <Zap size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Auto-Create</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Accord Managed</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-zinc-700 group-hover:text-white" />
                  </button>
                  
                  <button onClick={() => handleChoice('ghost')} className="w-full py-4 text-zinc-600 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                    Skip for now (Ghost Mode)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: External */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white uppercase italic">Link Wallet</h2>
                  <p className="text-zinc-500 text-xs mt-1">Select your primary provider.</p>
                </div>
                <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5 p-1">
                  <ConnectEmbed
                    client={client}
                    chain={injectiveTestnet}
                    wallets={[createWallet("app.keplr"), createWallet("io.metamask")]}
                    theme={"dark"}
                    onConnect={(w) => finalizeOnboarding(w.getAccount()?.address, 'external')}
                    className="!bg-transparent !border-0"
                  />
                </div>
                <button onClick={() => setStep(2)} className="w-full text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">← Back</button>
              </div>
            )}

            {/* Step 4: Info */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white uppercase italic">Self-Custody</h2>
                  <p className="text-zinc-500 text-xs mt-1">Non-custodial, fully owned by you.</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 flex-shrink-0 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"><CheckCircle2 size={16} /></div>
                    <p className="text-[10px] text-zinc-300 leading-relaxed uppercase font-bold tracking-tight">Full ownership. You alone control the keys.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 flex-shrink-0 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center"><Zap size={16} /></div>
                    <p className="text-[10px] text-zinc-300 leading-relaxed uppercase font-bold tracking-tight">One-tap recovery via your identity.</p>
                  </div>
                </div>

                <button 
                  onClick={() => finalizeOnboarding(tempWallet.getAccount()?.address, 'generated')}
                  disabled={loading}
                  className="w-full py-5 rounded-3xl bg-orange-600 text-white font-black hover:bg-orange-500 transition-all uppercase tracking-widest text-[10px]"
                >
                  {loading ? 'Activating...' : 'Activate Instant Wallet'}
                </button>
                <button onClick={() => setStep(2)} className="w-full text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">← Back</button>
              </div>
            )}

            {error && <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
          </div>

          {/* Footer */}
          <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-800 font-bold uppercase tracking-[0.2em]">Accord Protocol Trust Framework</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
