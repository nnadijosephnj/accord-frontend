import React, { useState } from "react";
import { ArrowDownUp, ChevronDown, DollarSign } from "lucide-react";

export default function Withdraw() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const stats = [
    { label: "Total withdrawn", value: "$0.00", sub: "All completed withdrawals" },
    { label: "Available to withdraw", value: "$0.00", sub: "Ready to send back to your wallet", primary: true },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdraw</h1>
          <p className="page-subtitle">Review your withdrawal history and move available balance back to your connected wallet.</p>
        </div>
        <button type="button" className="primary-button">
          <ArrowDownUp className="h-4 w-4" />
          Withdraw to Wallet
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className={stat.primary ? "metric-card-primary" : "metric-card"}>
            <p className="metric-label">{stat.label}</p>
            <p className={stat.primary ? "metric-value-primary mt-6" : "metric-value mt-6"}>{stat.value}</p>
            <p className="metric-copy mt-3">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="table-shell">
        <div className="flex items-center justify-between border-b border-[var(--accord-border)] px-6 py-4">
          <div>
            <p className="eyebrow">History</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Withdrawal activity</h2>
          </div>
          <div className="relative w-full max-w-[180px]">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-select pr-10">
              <option value="ALL">All statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
            <DollarSign className="h-6 w-6 text-[var(--accord-muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--accord-text)]">No withdrawals recorded</p>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">When funds leave the vault, the withdrawal will appear here.</p>
          </div>
          <button type="button" className="secondary-button">
            <ArrowDownUp className="h-4 w-4" />
            Withdraw to Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

