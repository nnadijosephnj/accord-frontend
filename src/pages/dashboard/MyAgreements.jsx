import React, { useEffect, useState } from "react";
import { ChevronDown, Download, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { apiCall } from "../../utils/api";

function normalizeStatus(status) {
  const normalized = status?.toUpperCase() || "PENDING";
  return normalized === "DELIVERED" ? "SUBMITTED" : normalized;
}

function getStatusBadge(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "FUNDED") return "status-badge status-active";
  if (["SUBMITTED", "REVISION", "PENDING"].includes(normalized)) return "status-badge status-pending";
  if (normalized === "COMPLETED") return "status-badge status-completed";
  if (normalized === "DISPUTED") return "status-badge status-disputed";
  if (normalized === "CANCELLED") return "status-badge status-cancelled";
  return "status-badge status-cancelled";
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative min-w-[160px]">
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

export default function MyAgreements() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL_TIME");

  useEffect(() => {
    if (address) {
      loadAgreements();
    }
  }, [address]);

  const loadAgreements = async () => {
    try {
      const data = await apiCall("/api/agreements");
      setAgreements(data || []);
    } catch (error) {
      console.warn(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = agreements.filter((agreement) => {
    const query = search.trim().toLowerCase();
    const normalizedStatus = normalizeStatus(agreement.status);
    const matchSearch =
      !query ||
      agreement.id?.toLowerCase().includes(query) ||
      agreement.title?.toLowerCase().includes(query) ||
      agreement.amount?.toString().includes(query) ||
      agreement.client_wallet?.toLowerCase().includes(query) ||
      agreement.freelancer_wallet?.toLowerCase().includes(query);

    const matchStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
    const matchType =
      typeFilter === "ALL" ||
      (typeFilter === "FREELANCER" && agreement.freelancer_wallet?.toLowerCase() === address?.toLowerCase()) ||
      (typeFilter === "CLIENT" && agreement.client_wallet?.toLowerCase() === address?.toLowerCase());

    void dateFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Agreements</h1>
          <p className="page-subtitle">Track every agreement you are part of, including pending work, active escrow, and completed payouts.</p>
        </div>
        <button type="button" className="secondary-button">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="surface-card">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.7fr))]">
          <label className="relative">
            <span className="sr-only">Search agreements</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, ID, wallet, or amount"
              className="field-input pl-11"
            />
          </label>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "FUNDED", label: "Active" },
              { value: "SUBMITTED", label: "Submitted" },
              { value: "REVISION", label: "Revision" },
              { value: "COMPLETED", label: "Completed" },
              { value: "DISPUTED", label: "Disputed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "ALL", label: "All roles" },
              { value: "FREELANCER", label: "As freelancer" },
              { value: "CLIENT", label: "As client" },
            ]}
          />
          <FilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: "ALL_TIME", label: "All time" },
              { value: "TODAY", label: "Today" },
              { value: "THIS_WEEK", label: "This week" },
              { value: "THIS_MONTH", label: "This month" },
              { value: "THIS_YEAR", label: "This year" },
            ]}
          />
        </div>
      </div>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead className="table-head">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Agreement</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">ID</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Parties</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm text-[var(--accord-muted)]">
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--accord-primary-line)] border-t-[var(--accord-primary)] animate-spin" />
                      Loading agreements
                    </div>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((agreement) => (
                  <tr key={agreement.id} onClick={() => navigate(`/deal/${agreement.id}`)} className="table-row cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                          <FileText className="h-4 w-4 text-[var(--accord-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--accord-text)]">{agreement?.title || "Untitled agreement"}</p>
                          <p className="mt-1 text-xs text-[var(--accord-muted)]">Escrow agreement</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">#{agreement?.id?.slice(0, 8) || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">
                      <p>Client: {agreement?.client_wallet ? `${agreement.client_wallet.slice(0, 6)}...${agreement.client_wallet.slice(-4)}` : "—"}</p>
                      <p className="mt-1">
                        Freelancer: {agreement?.freelancer_wallet ? `${agreement.freelancer_wallet.slice(0, 6)}...${agreement.freelancer_wallet.slice(-4)}` : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--accord-primary)]">
                      ${parseFloat(agreement?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(agreement?.status)}>{normalizeStatus(agreement?.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">
                      {agreement?.created_at ? new Date(agreement.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                        <FileText className="h-6 w-6 text-[var(--accord-muted)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--accord-text)]">No agreements matched your filters</p>
                        <p className="mt-2 text-sm text-[var(--accord-muted)]">Try another search term or clear a filter to see more results.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


