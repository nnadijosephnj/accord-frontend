import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { AlertTriangle, Check, CheckCircle2, Copy, Wallet } from "lucide-react";
import { useWallet } from "../../context/WalletContext";

export default function ConnectedWallet() {
  const { address, logout, network } = useWallet();
  const [copied, setCopied] = useState(false);
  const networkLabel = network === "mainnet" ? "Injective EVM Mainnet" : "Injective EVM Testnet";

  const handleCopy = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Connected Wallet</h1>
        <p className="page-subtitle">Review the active wallet connected to Accord and confirm the network you are using.</p>
      </div>

      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="surface-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
            <Wallet className="h-5 w-5 text-[var(--accord-primary)]" />
          </div>
          <div>
            <p className="eyebrow">Active wallet</p>
            <p className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">{networkLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-muted px-4 py-4">
            <p className="field-label">Wallet address</p>
            <div className="mt-3 flex items-center gap-3">
              <p className="flex-1 break-all text-sm text-[var(--accord-text)]">{address || "—"}</p>
              <button type="button" onClick={handleCopy} className="icon-button h-10 w-10">
                {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="surface-muted px-4 py-4">
            <p className="field-label">Network</p>
            <p className="mt-3 text-sm font-semibold text-[var(--accord-text)]">{networkLabel}</p>
          </div>

          <div className="surface-muted flex items-center gap-3 px-4 py-4">
            <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
            <div>
              <p className="field-label">Connection status</p>
              <p className="mt-2 text-sm font-semibold text-[#22C55E]">Connected</p>
            </div>
          </div>
        </div>
      </Motion.div>

      <button type="button" onClick={logout} className="destructive-button">
        <AlertTriangle className="h-4 w-4" />
        Disconnect Wallet
      </button>
    </div>
  );
}

