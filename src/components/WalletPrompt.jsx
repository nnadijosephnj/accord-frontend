import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap, ShieldCheck, ArrowRight, Loader2, Link as LinkIcon } from "lucide-react";
import { useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { getUserByEmail, linkWalletToUser } from "../lib/supabaseHelpers";

export default function WalletPrompt({ email, loginMethod, onComplete }) {
  const { connect } = useConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLinkWallet(walletId) {
    setLoading(true);
    setError("");
    try {
      if (walletId === "app.keplr" && !window.keplr) {
        window.open("https://www.keplr.app/download", "_blank");
        throw new Error("Keplr extension not found. Opening download page...");
      }

      await connect(async () => {
        const wallet = createWallet(walletId);
        await wallet.connect({ client, chain: injectiveTestnet });
        return wallet;
      });
      
      onComplete();
    } catch (err) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoCreate() {
    setLoading(true);
    // Auto-create just uses the existing in-app wallet address
    // We already have the user's email from the login
    try {
      // Logic would go here to confirm the in-app wallet is the primary
      onComplete();
    } catch (err) {
        setError("Failed to initialize wallet");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-6">
          <Wallet size={32} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Secure Your Account</h2>
        <p className="text-zinc-500 font-medium">Link a wallet to start signing agreements</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold animate-shake">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div className="p-1 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent">
          <button
            onClick={() => handleLinkWallet("app.keplr")}
            disabled={loading}
            className="w-full flex items-center justify-between p-6 rounded-[1.8rem] bg-[#1a1a1a] hover:bg-[#222] border border-white/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="https://avatars.githubusercontent.com/u/40890691?s=200&v=4" alt="Keplr" className="w-7 h-7 rounded-lg" />
              </div>
              <div className="text-left">
                <p className="font-black text-white">Link Keplr Wallet</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Recommended for Injective</p>
              </div>
            </div>
            <LinkIcon size={20} className="text-zinc-600 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        <div className="relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="px-4 py-1 bg-[#121212] text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] border border-white/5 rounded-full">Or</span>
            </div>
            <div className="h-px bg-white/5 w-full my-8" />
        </div>

        <button
          onClick={handleAutoCreate}
          disabled={loading}
          className="group relative w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-orange-400 text-white overflow-hidden shadow-2xl hover:shadow-orange-500/40 transition-all active:scale-[0.98]"
        >
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Zap size={28} className="fill-white" />
            </div>
            <div className="text-center">
                <p className="text-xl font-black tracking-tight mb-1">Auto-Create Wallet</p>
                <p className="text-orange-100/70 text-sm font-bold">No downloads, no seed phrases. Instantly secured.</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
        </button>
      </div>

      <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest px-8">
        Your security is our priority. Every wallet on Accord is non-custodial and fully owned by you.
      </p>
    </div>
  );
}
