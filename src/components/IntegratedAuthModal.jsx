import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Loader2, Link as LinkIcon, ShieldAlert } from "lucide-react";
import { useConnect, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet, preAuthenticate } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { upsertUser } from "../lib/supabaseHelpers";
import WalletPrompt from "./WalletPrompt";

export default function IntegratedAuthModal({ isOpen, onClose, onComplete }) {
  const { connect } = useConnect();
  const activeAccount = useActiveAccount();

  const [step, setStep] = useState("login");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [socialEmail, setSocialEmail] = useState(""); 
  const [loginMethod, setLoginMethod] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleConnectWallet(walletId) {
    setError("");
    setLoading(true);
    try {
      if (walletId === "app.keplr" && !window.keplr) {
        window.open("https://www.keplr.app/download", "_blank");
        throw new Error("Keplr extension not found. Opening download page...");
      }

      const walletInstance = await connect(async () => {
        const wallet = createWallet(walletId);
        await wallet.connect({ client, chain: injectiveTestnet });
        return wallet;
      });

      const address = walletInstance.getAccount()?.address;
      if (address) {
        await upsertUser({
          walletAddress: address,
          email: null,
          loginMethod: "wallet",
          walletType: "external",
        });
      }

      onComplete(); 
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const wallet = inAppWallet();
      const googleAccount = await wallet.connect({
        client,
        chain: injectiveTestnet,
        strategy: "google",
      });
      setSocialEmail(googleAccount?.email || "");
      setLoginMethod("google");
      // Skip the immediate prompt, go straight to dashboard
      onComplete();
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    if (!emailInput || !emailInput.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await preAuthenticate({ client, strategy: "email", email: emailInput });
      setLoginMethod("email");
      setSocialEmail(emailInput);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otpInput || otpInput.length < 4) {
      setError("Enter code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const wallet = inAppWallet();
      await wallet.connect({
        client,
        chain: injectiveTestnet,
        strategy: "email",
        email: socialEmail,
        verificationCode: otpInput,
      });
      // Skip the immediate prompt, go straight to dashboard
      onComplete();
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[480px] bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {step === "login" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">Login to Accord</h2>
                <p className="text-zinc-500 font-medium tracking-tight">Access your agreements safely</p>
              </div>

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">{error}</div>}

              <div className="grid gap-3">
                <button onClick={() => handleConnectWallet("app.keplr")} disabled={loading} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all">
                  <div className="flex items-center gap-4">
                    <img src="https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/wallet-icons/keplr.png" alt="Keplr" className="w-8 h-8" />
                    <span className="font-bold text-white">Keplr Wallet</span>
                  </div>
                  <ArrowRight size={18} className="text-zinc-600" />
                </button>

                <button onClick={() => handleConnectWallet("io.metamask")} disabled={loading} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all">
                  <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8" />
                    <span className="font-bold text-white">MetaMask</span>
                  </div>
                  <ArrowRight size={18} className="text-zinc-600" />
                </button>
              </div>

              <div className="relative flex justify-center text-xs uppercase font-black text-zinc-700">
                <span className="bg-[#121212] px-4">or</span>
              </div>

              <div className="space-y-4">
                <button onClick={loginWithGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-colors">
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email address" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold focus:outline-none focus:border-orange-500" />
                  <button onClick={sendOtp} disabled={loading || !emailInput} className="p-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white transition-colors">
                    {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">Confirm OTP</h2>
                <p className="text-zinc-500 font-medium">Sent to {socialEmail}</p>
              </div>
              <input type="text" placeholder="000000" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-3xl font-black text-white focus:outline-none focus:border-orange-500" maxLength={6} />
              <button onClick={verifyOtp} disabled={loading} className="w-full py-5 rounded-2xl bg-orange-600 font-black text-white hover:bg-orange-500 transition-colors">Verify Code</button>
              <button onClick={() => setStep("login")} className="w-full text-zinc-500 font-bold text-sm">← Back</button>
            </div>
          )}

          {step === "wallet-prompt" && (
            <WalletPrompt email={socialEmail} loginMethod={loginMethod} onComplete={onComplete} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
