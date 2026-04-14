import React, { useState } from "react";
import { AlertTriangle, ChevronDown, Download, Search } from "lucide-react";

export default function Disputes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Disputes</h1>
          <p className="page-subtitle">Monitor agreement disputes and review any exceptions that need intervention.</p>
        </div>
        <button type="button" className="secondary-button">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="surface-card">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr]">
          <label className="relative">
            <span className="sr-only">Search disputes</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by agreement ID or wallet address"
              className="field-input pl-11"
            />
          </label>
          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-select pr-10">
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
          </div>
        </div>
      </div>

      <div className="surface-card flex flex-col items-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.08)]">
          <AlertTriangle className="h-7 w-7 text-[var(--accord-danger)]" />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--accord-text)]">No disputes found</p>
          <p className="mt-2 text-sm text-[var(--accord-muted)]">Your agreements are currently progressing without disputes.</p>
        </div>
      </div>
    </div>
  );
}


