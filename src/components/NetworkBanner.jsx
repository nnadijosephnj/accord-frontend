import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";

export default function NetworkBanner() {
  const { isTestnet } = useNetwork();

  if (!isTestnet) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 px-4 py-2.5 text-white shadow-[0_10px_30px_rgba(234,88,12,0.25)]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-[11px] font-black uppercase tracking-[0.28em] sm:text-xs">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>Testnet Mode Active - No real funds</span>
      </div>
    </div>
  );
}
