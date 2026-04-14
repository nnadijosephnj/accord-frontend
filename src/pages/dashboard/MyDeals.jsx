import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Download, FileText, Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

export default function MyDeals() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const loadData = async () => {
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
    const normalizedStatus = normalizeStatus(agreement.status);
    const matchSearch =
      !search.trim() ||
      agreement.title?.toLowerCase().includes(search.trim().toLowerCase()) ||
      agreement.id?.toLowerCase().includes(search.trim().toLowerCase());
    const matchStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total", value: agreements.length },
    { label: "Active", value: agreements.filter((agreement) => ["FUNDED", "SUBMITTED"].includes(normalizeStatus(agreement.status))).length },
    { label: "Pending", value: agreements.filter((agreement) => normalizeStatus(agreement.status) === "PENDING").length },
    { label: "Closed", value: agreements.filter((agreement) => ["COMPLETED", "CANCELLED"].includes(normalizeStatus(agreement.status))).length },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Deals</h1>
          <p className="page-subtitle">Review the agreements you have created and monitor their current escrow state.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="secondary-button">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link to="/dashboard/agreements/create" className="primary-button">
            <Plus className="h-4 w-4" />
            Create Agreement
          </Link>
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
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.5fr_auto]">
          <label className="relative">
            <span className="sr-only">Search deals</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or agreement ID"
              className="field-input pl-11"
            />
          </label>
          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-select pr-10">
              {[
                { value: "ALL", label: "All statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "FUNDED", label: "Active" },
                { value: "SUBMITTED", label: "Submitted" },
                { value: "REVISION", label: "Revision" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
          </div>
          <button type="button" className="secondary-button">
            Search
          </button>
        </div>
      </div>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="table-head">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Title</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">ID</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Created</th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Open</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm text-[var(--accord-muted)]">
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--accord-primary-line)] border-t-[var(--accord-primary)] animate-spin" />
                      Loading deals
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
                        <p className="text-sm font-semibold text-[var(--accord-text)]">{agreement?.title || "Untitled agreement"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">#{agreement?.id?.slice(0, 8) || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--accord-primary)]">
                      ${parseFloat(agreement?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(agreement?.status)}>{normalizeStatus(agreement?.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">
                      {agreement?.created_at ? new Date(agreement.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowRight className="ml-auto h-4 w-4 text-[var(--accord-muted)]" />
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
                        <p className="text-sm font-semibold text-[var(--accord-text)]">No deals found</p>
                        <p className="mt-2 text-sm text-[var(--accord-muted)]">Create a new agreement to start using this workspace.</p>
                      </div>
                      <Link to="/dashboard/agreements/create" className="primary-button">
                        <Plus className="h-4 w-4" />
                        Create Agreement
                      </Link>
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


