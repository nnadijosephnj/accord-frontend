import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, FileText, Shield, Wallet } from "lucide-react";
import * as ethers from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS, USDC_ADDRESS } from "../../utils/contractABI";
import { apiCall } from "../../utils/api";

function normalizeStatus(status) {
  const normalized = status?.toUpperCase() || "PENDING";
  return normalized === "DELIVERED" ? "SUBMITTED" : normalized;
}

function getStatusBadge(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "FUNDED") {
    return "status-badge status-active";
  }
  if (["SUBMITTED", "REVISION", "PENDING"].includes(normalized)) {
    return "status-badge status-pending";
  }
  if (normalized === "COMPLETED") {
    return "status-badge status-completed";
  }
  if (normalized === "DISPUTED") {
    return "status-badge status-disputed";
  }
  if (normalized === "CANCELLED") {
    return "status-badge status-cancelled";
  }

  return "status-badge status-cancelled";
}

export default function Overview() {
  const { address, signer } = useWallet();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [vaultBalance, setVaultBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const data = await apiCall("/api/agreements");
      setAgreements(data || []);
    } catch (error) {
      console.warn(error.message);
    } finally {
      setLoading(false);
    }

    try {
      if (signer) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const balance = await contract.vaultBalances(address, USDC_ADDRESS);
        if (balance !== undefined) {
          setVaultBalance(Number(ethers.formatUnits(balance, 6)).toFixed(2));
        }
      }
    } catch (error) {
      console.warn("Vault load error:", error);
    }
  };

  const inEscrow = agreements
    .filter((agreement) => ["FUNDED", "SUBMITTED"].includes(normalizeStatus(agreement.status)))
    .reduce((sum, agreement) => sum + parseFloat(agreement.amount || 0), 0)
    .toFixed(2);

  const pending = agreements.filter((agreement) => normalizeStatus(agreement.status) === "PENDING").length;
  const awaitingApproval = agreements.filter((agreement) => normalizeStatus(agreement.status) === "SUBMITTED").length;

  const stats = [
    {
      label: "Amount in escrow",
      value: `$${inEscrow}`,
      sub: "Currently locked in active work",
      icon: Shield,
      primary: true,
    },
    {
      label: "Pending agreements",
      value: pending,
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">A concise view of your escrow activity, balances, and active agreements.</p>
        </div>
      </div>

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

      <Motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
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
                agreements.slice(0, 6).map((agreement) => (
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
                          <p className="mt-1 text-xs text-[var(--accord-muted)]">Standard escrow agreement</p>
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                        <FileText className="h-6 w-6 text-[var(--accord-muted)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--accord-text)]">No agreements yet</p>
                        <p className="mt-2 text-sm text-[var(--accord-muted)]">Create your first agreement to start using Accord.</p>
                      </div>
                    </div>
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


