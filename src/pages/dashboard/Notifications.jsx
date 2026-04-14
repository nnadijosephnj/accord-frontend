import React, { useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";

function SelectDropdown({ value, onChange, options }) {
  return (
    <div className="relative min-w-[180px]">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-select pr-10">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
    </div>
  );
}

export default function Notifications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL_TIME");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Review activity updates, transaction messages, and account-level alerts.</p>
      </div>

      <div className="surface-card">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(2,minmax(0,0.7fr))]">
          <label className="relative">
            <span className="sr-only">Search notifications</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by subject or message"
              className="field-input pl-11"
            />
          </label>
          <SelectDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "SENT", label: "Sent" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
          <SelectDropdown
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: "ALL_TIME", label: "All time" },
              { value: "TODAY", label: "Today" },
              { value: "THIS_WEEK", label: "This week" },
              { value: "THIS_MONTH", label: "This month" },
            ]}
          />
        </div>
      </div>

      <div className="table-shell">
        <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
            <Bell className="h-6 w-6 text-[var(--accord-muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--accord-text)]">No notifications yet</p>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">New agreement activity and status updates will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

