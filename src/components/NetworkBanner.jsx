import React from "react";
import { useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";

export default function NetworkBanner() {
  const { isTestnet } = useNetwork();
  const location = useLocation();

  if (!isTestnet || location.pathname === "/") {
    return null;
  }

  return (
    <div className="border-b border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] px-4 py-2.5">
      <div className="page-shell flex items-center justify-center gap-2 text-center">
        <ShieldAlert className="h-4 w-4 text-[var(--accord-primary)]" />
        <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--accord-primary)]">
          Testnet Mode Active
        </span>
        <span className="hidden text-[12px] text-[var(--accord-muted)] sm:inline">No real funds are moved on this network.</span>
      </div>
    </div>
  );
}

