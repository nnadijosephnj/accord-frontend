import React, { useState } from "react";
import { Download, Mail, Search, Send } from "lucide-react";

export default function ReceivedLinks() {
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Total links", value: 0 },
    { label: "Pending", value: 0 },
    { label: "Sent", value: 0 },
    { label: "Expired", value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Received Links</h1>
          <p className="page-subtitle">Track agreement links sent to you and review their current status from one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="secondary-button">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" className="primary-button">
            <Send className="h-4 w-4" />
            Send Link
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <p className="metric-label">{stat.label}</p>
            <p className="metric-value mt-6">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="surface-card">
        <label className="relative block">
          <span className="sr-only">Search received links</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by wallet address"
            className="field-input pl-11"
          />
        </label>
      </div>

      <div className="surface-card flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
          <Mail className="h-7 w-7 text-[var(--accord-muted)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--accord-text)]">No received links yet</p>
          <p className="mt-2 text-sm text-[var(--accord-muted)]">Agreement links that reach your account will appear here.</p>
        </div>
      </div>
    </div>
  );
}

