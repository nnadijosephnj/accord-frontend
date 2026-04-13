import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Wallet, Copy, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export default function ConnectedWallet() {
  const { address, logout, network } = useWallet();
  const [copied, setCopied] = useState(false);
  const networkLabel = network === 'mainnet' ? 'Injective EVM Mainnet' : 'Injective EVM Testnet';

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Connected Wallet</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your wallet connected to Accord</p>
      </div>

      {/* Wallet Card */}
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Active Wallet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{networkLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
              Wallet Address
            </label>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
              <p className="text-sm font-mono text-zinc-900 dark:text-white flex-1 break-all">
                {address || '—'}
              </p>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Network */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
              Network
            </label>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <p className="text-sm text-zinc-900 dark:text-white font-medium">{networkLabel}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
              Connection Status
            </label>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">Connected</p>
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Disconnect */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Disconnect Wallet
      </button>
    </div>
  );
}
