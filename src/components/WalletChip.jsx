import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * WalletChip — a truncated wallet address with a copy-to-clipboard button.
 *
 * @param {{ address: string, label?: string, full?: boolean }} props
 *   If `full` is true the address is shown in full, otherwise truncated.
 */
export default function WalletChip({ address, label, full = false }) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return <span className="wallet-chip">—</span>;
  }

  const display = full ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard API may not be available */
    }
  };

  return (
    <span className="wallet-chip">
      {label ? <span className="text-[var(--accord-muted)] text-xs font-medium uppercase tracking-wider">{label}</span> : null}
      <span>{display}</span>
      <button type="button" onClick={handleCopy} className="wallet-chip-copy" aria-label="Copy address">
        {copied ? <Check className="h-3.5 w-3.5 text-[var(--accord-success)]" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
