import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import * as ethers from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "../../utils/contractABI";
import { apiCall } from "../../utils/api";
import StatusRing from "../../components/StatusRing";
import ActivityFeed from "../../components/ActivityFeed";
import EmptyState from "../../components/EmptyState";

const VAULT_BALANCE_ABI = parseAbi([
  "function vaultBalances(address user, address token) view returns (uint256)",
]);

/* ── helpers ── */

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

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getActivityIcon(status) {
  const n = normalizeStatus(status);
  if (n === "FUNDED") return { icon: <DollarSign className="h-4 w-4 text-[var(--accord-primary)]" />, variant: "primary" };
  if (n === "SUBMITTED") return { icon: <FileText className="h-4 w-4 text-[#a855f7]" />, variant: "warning" };
  if (n === "COMPLETED") return { icon: <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />, variant: "success" };
  if (n === "DISPUTED") return { icon: <AlertTriangle className="h-4 w-4 text-[#ef4444]" />, variant: "danger" };
  return { icon: <Clock className="h-4 w-4 text-[var(--accord-muted)]" />, variant: "" };
}

/* ── component ── */

export default function Overview() {
  const { address } = useWallet();
  const publicClient = usePublicClient();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [vaultBalance, setVaultBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAgreements = async () => {
      if (!address) {
        if (isMounted) {
          setAgreements([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const data = await apiCall("/api/agreements");
        if (isMounted) {
          setAgreements(data || []);
        }
      } catch (error) {
        console.warn(error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAgreements();

    return () => {
      isMounted = false;
    };
  }, [address]);

  useEffect(() => {
    let isMounted = true;

    const loadVaultBalance = async () => {
      if (!address || !publicClient) {
        if (isMounted) {
          setVaultBalance("0.00");
        }
        return;
      }

      try {
        const balance = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: VAULT_BALANCE_ABI,
          functionName: "vaultBalances",
          args: [address, USDC_ADDRESS],
        });

        if (isMounted) {
          setVaultBalance(Number(ethers.formatUnits(balance, 6)).toFixed(2));
        }
      } catch (error) {
        console.warn("Vault load error:", error);
        if (isMounted) {
          setVaultBalance("0.00");
        }
      }
    };

    loadVaultBalance();

    return () => {
      isMounted = false;
    };
  }, [address, publicClient]);

  /* ── derived data ── */

  const activeCount = agreements.filter((a) => ["FUNDED", "SUBMITTED", "REVISION"].includes(normalizeStatus(a.status))).length;
  const pendingCount = agreements.filter((a) => normalizeStatus(a.status) === "PENDING").length;
  const completedCount = agreements.filter((a) => normalizeStatus(a.status) === "COMPLETED").length;
  const disputedCount = agreements.filter((a) => normalizeStatus(a.status) === "DISPUTED").length;

  const inEscrow = agreements
    .filter((a) => ["FUNDED", "SUBMITTED"].includes(normalizeStatus(a.status)))
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0)
    .toFixed(2);

  const awaitingApproval = agreements.filter((a) => normalizeStatus(a.status) === "SUBMITTED").length;

  /* ── action items ── */

  const actionItems = [];

  agreements.forEach((a) => {
    const n = normalizeStatus(a.status);
    const isClient = a.client_wallet?.toLowerCase() === address?.toLowerCase();
    const isFreelancer = a.freelancer_wallet?.toLowerCase() === address?.toLowerCase();

    if (n === "PENDING" && isClient) {
      actionItems.push({
        color: "amber",
        icon: <DollarSign className="h-4 w-4" />,
        title: `Fund escrow for "${a.title || "Untitled"}"`,
        desc: `$${parseFloat(a.amount || 0).toFixed(2)} USDC awaiting deposit`,
        path: `/deal/${a.id}`,
      });
    }
    if (n === "SUBMITTED" && isClient) {
      actionItems.push({
        color: "purple",
        icon: <CheckCircle2 className="h-4 w-4" />,
        title: `Review submission for "${a.title || "Untitled"}"`,
        desc: "Freelancer has delivered — approve or request revision",
        path: `/deal/${a.id}`,
      });
    }
    if (n === "DISPUTED") {
      actionItems.push({
        color: "red",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `Dispute raised on "${a.title || "Untitled"}"`,
        desc: isFreelancer ? "You may need to provide evidence" : "Review the dispute details",
        path: `/deal/${a.id}`,
      });
    }
    if (n === "PENDING" && isFreelancer) {
      actionItems.push({
        color: "blue",
        icon: <Clock className="h-4 w-4" />,
        title: `Waiting for client to fund "${a.title || "Untitled"}"`,
        desc: "Share the agreement link with your client",
        path: `/deal/${a.id}`,
      });
    }
  });

  /* ── ring chart segments ── */

  const ringSegments = [
    { value: activeCount, color: "#ff751f" },
    { value: pendingCount, color: "#f59e0b" },
    { value: completedCount, color: "#22c55e" },
    { value: disputedCount, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  /* ── recent activity from agreements ── */

  const recentActivity = [...agreements]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5)
    .map((a) => {
      const act = getActivityIcon(a.status);
      return {
        icon: act.icon,
        variant: act.variant,
        title: a.title || "Untitled agreement",
        description: `Status: ${normalizeStatus(a.status)} · $${parseFloat(a.amount || 0).toFixed(2)}`,
        time: timeAgo(a.updated_at || a.created_at),
        onClick: () => navigate(`/deal/${a.id}`),
      };
    });

  /* ── stat cards ── */

  const stats = [
    {
      label: "Amount in escrow",
      value: `$${inEscrow}`,
      sub: "Currently locked in active agreements",
      icon: Shield,
      primary: true,
    },
    {
      label: "Pending agreements",
      value: pendingCount,
      sub: "Waiting on the next action",
      icon: Clock,
    },
    {
      label: "Awaiting approval",
      value: awaitingApproval,
      sub: "Submitted and under review",
      icon: CheckCircle2,
    },
    {
      label: "Vault balance",
      value: `$${vaultBalance}`,
      sub: "Available for future agreements",
      icon: Wallet,
    },
  ];

  /* ── render ── */

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your command center — balances, active deals, and items that need your attention.</p>
        </div>
      </div>

      {/* ── Vault Hero + Ring ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="vault-hero"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="vault-hero-label">Vault Balance</p>
              <p className="vault-hero-amount">${vaultBalance}</p>
              <p className="vault-hero-sub">Available across all connected wallets</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
              <Wallet className="h-5 w-5 text-[var(--accord-primary)]" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/dashboard/agreements/create" className="primary-button px-5 py-2.5 text-xs">
              <Plus className="h-4 w-4" />
              New Agreement
            </Link>
            <Link to="/dashboard/vault" className="secondary-button px-5 py-2.5 text-xs">
              <TrendingUp className="h-4 w-4" />
              Fund Vault
            </Link>
            <Link to="/dashboard/vault/withdraw" className="secondary-button px-5 py-2.5 text-xs">
              <ArrowDownUp className="h-4 w-4" />
              Withdraw
            </Link>
          </div>
        </Motion.div>

        {/* ── Status Ring Chart ── */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="surface-card flex flex-col items-center justify-center px-8"
        >
          <StatusRing
            segments={ringSegments.length ? ringSegments : [{ value: 1, color: "var(--accord-border)" }]}
            size={96}
            strokeWidth={8}
            center={
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--accord-text)]">{agreements.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--accord-muted)]">Total</p>
              </div>
            }
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {[
              { label: "Active", color: "#ff751f", count: activeCount },
              { label: "Pending", color: "#f59e0b", count: pendingCount },
              { label: "Done", color: "#22c55e", count: completedCount },
              { label: "Disputed", color: "#ef4444", count: disputedCount },
            ].map((legend) => (
              <div key={legend.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: legend.color }} />
                <span className="text-[11px] text-[var(--accord-muted)]">{legend.label} ({legend.count})</span>
              </div>
            ))}
          </div>
        </Motion.div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.28 }}
              className={stat.primary ? "metric-card-primary" : "metric-card"}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="metric-label">{stat.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                  <Icon className={`h-4 w-4 ${stat.primary ? "text-[var(--accord-primary)]" : "text-[var(--accord-muted)]"}`} />
                </div>
              </div>
              <p className={stat.primary ? "metric-value-primary mt-6" : "metric-value mt-6"}>{stat.value}</p>
              <p className="metric-copy mt-3">{stat.sub}</p>
            </Motion.div>
          );
        })}
      </div>

      {/* ── What Needs Your Attention ── */}
      {actionItems.length > 0 ? (
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="surface-card"
        >
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="eyebrow">Attention required</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">What needs your action</h2>
            </div>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--accord-primary)] text-xs font-bold text-[var(--accord-primary-contrast)]">
              {actionItems.length}
            </span>
          </div>

          <div className="space-y-2">
            {actionItems.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="action-item"
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
              >
                <div className={`action-item-icon ${item.color}`}>
                  {item.icon}
                </div>
                <div className="action-item-body">
                  <p className="action-item-title">{item.title}</p>
                  <p className="action-item-desc">{item.desc}</p>
                </div>
                <ArrowRight className="action-item-arrow h-4 w-4" />
              </div>
            ))}
          </div>
        </Motion.section>
      ) : null}

      {/* ── Two-Column: Quick Actions + Activity Feed ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Quick Actions */}
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="surface-card"
        >
          <div className="pb-4">
            <p className="eyebrow">Shortcuts</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Quick actions</h2>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard/agreements/create" className="quick-action">
              <div className="quick-action-icon"><Plus className="h-5 w-5" /></div>
              <div className="quick-action-body">
                <p className="quick-action-label">New Agreement</p>
                <p className="quick-action-desc">Create a new escrow deal with a counterparty</p>
              </div>
            </Link>
            <Link to="/dashboard/vault" className="quick-action">
              <div className="quick-action-icon"><TrendingUp className="h-5 w-5" /></div>
              <div className="quick-action-body">
                <p className="quick-action-label">Fund Vault</p>
                <p className="quick-action-desc">Deposit USDC to prepare for future agreements</p>
              </div>
            </Link>
            <Link to="/dashboard/vault/withdraw" className="quick-action">
              <div className="quick-action-icon"><ArrowDownUp className="h-5 w-5" /></div>
              <div className="quick-action-body">
                <p className="quick-action-label">Withdraw</p>
                <p className="quick-action-desc">Move available funds back to your wallet</p>
              </div>
            </Link>
          </div>
        </Motion.section>

        {/* Recent Activity */}
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="surface-card"
        >
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="eyebrow">Activity</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Recent events</h2>
            </div>
            <Link to="/dashboard/notifications" className="secondary-button px-4 py-2 text-xs">
              View All
            </Link>
          </div>

          {recentActivity.length ? (
            <ActivityFeed items={recentActivity} />
          ) : (
            <EmptyState
              icon={<Clock className="h-6 w-6 text-[var(--accord-muted)]" />}
              title="No recent activity"
              description="Events from your agreements will appear here as they happen."
            />
          )}
        </Motion.section>
      </div>

      {/* ── Recent Agreements Table ── */}
      <Motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="table-shell"
      >
        <div className="flex items-center justify-between border-b border-[var(--accord-border)] px-6 py-4">
          <div>
            <p className="eyebrow">Recent agreements</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Active agreement activity</h2>
          </div>
          <Link to="/dashboard/agreements" className="secondary-button px-4 py-2 text-xs">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="table-head">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Agreement</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">ID</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Parties</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Created</th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.14em] text-[var(--accord-muted)]">Open</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm text-[var(--accord-muted)]">
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--accord-primary-line)] border-t-[var(--accord-primary)] animate-spin" />
                      Loading agreements
                    </div>
                  </td>
                </tr>
              ) : agreements.length ? (
                agreements.slice(0, 6).map((agreement) => {
                  const isClient = agreement.client_wallet?.toLowerCase() === address?.toLowerCase();
                  return (
                    <tr
                      key={agreement.id}
                      onClick={() => agreement?.id && navigate(`/deal/${agreement.id}`)}
                      className="table-row cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                            <FileText className="h-4 w-4 text-[var(--accord-primary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--accord-text)]">{agreement?.title || "Untitled agreement"}</p>
                            <p className="mt-1 text-xs text-[var(--accord-muted)]">
                              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${isClient ? "bg-[rgba(168,85,247,0.1)] text-[#a855f7]" : "bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"}`}>
                                {isClient ? "Client" : "Freelancer"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">#{agreement?.id?.slice(0, 8) || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-[var(--accord-muted)]">
                        <p>Client: {agreement?.client_wallet ? `${agreement.client_wallet.slice(0, 6)}...${agreement.client_wallet.slice(-4)}` : "—"}</p>
                        <p className="mt-1">Freelancer: {agreement?.freelancer_wallet ? `${agreement.freelancer_wallet.slice(0, 6)}...${agreement.freelancer_wallet.slice(-4)}` : "—"}</p>
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
                      <td className="px-6 py-4 text-right">
                        <ArrowRight className="ml-auto h-4 w-4 text-[var(--accord-muted)]" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <EmptyState
                      icon={<FileText className="h-6 w-6 text-[var(--accord-muted)]" />}
                      title="No agreements yet"
                      description="Create your first agreement to start using Accord."
                      action={
                        <Link to="/dashboard/agreements/create" className="primary-button px-5 py-2.5 text-xs">
                          <Plus className="h-4 w-4" />
                          Create Agreement
                        </Link>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Motion.div>
    </div>
  );
}
