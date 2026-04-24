import React, { useEffect, useState } from "react";
import { ArrowDownUp, DollarSign, Lock, Plus, TrendingUp, Wallet } from "lucide-react";
import * as ethers from "ethers";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "../../utils/contractABI";

const VAULT_BALANCE_ABI = parseAbi([
  "function vaultBalances(address user, address token) view returns (uint256)",
]);

export default function VaultPage() {
  const { address, network } = useWallet();
  const publicClient = usePublicClient();
  const [vaultBalance, setVaultBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const networkLabel = network === "mainnet" ? "Injective EVM Mainnet" : "Injective EVM Testnet";

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      if (!address || !publicClient) {
        if (isMounted) {
          setVaultBalance("0.00");
          setLoading(false);
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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBalance();

    return () => {
      isMounted = false;
    };
  }, [address, publicClient]);

  const cards = [
    {
      label: "Vault balance",
      value: `$${vaultBalance}`,
      sub: "Available to assign to new agreements",
      icon: DollarSign,
      primary: true,
    },
    {
      label: "In escrow",
      value: "$0.00",
      sub: "Currently locked in active agreements",
      icon: Lock,
    },
    {
      label: "Total deposited",
      value: "$0.00",
      sub: "Lifetime incoming funds",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vault</h1>
          <p className="page-subtitle">View your Accord balance and move funds into or out of escrow workflows.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dashboard/vault/withdraw" className="secondary-button">
            <ArrowDownUp className="h-4 w-4" />
            Withdraw
          </Link>
          <button type="button" className="primary-button">
            <Plus className="h-4 w-4" />
            Deposit USDC
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className={card.primary ? "metric-card-primary" : "metric-card"}>
              <div className="flex items-start justify-between gap-3">
                <p className="metric-label">{card.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                  <Icon className={`h-4 w-4 ${card.primary ? "text-[var(--accord-primary)]" : "text-[var(--accord-muted)]"}`} />
                </div>
              </div>
              <p className={card.primary ? "metric-value-primary mt-6" : "metric-value mt-6"}>{loading && card.primary ? "..." : card.value}</p>
              <p className="metric-copy mt-3">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--accord-border)] pb-4">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Vault events</h2>
            </div>
            <button type="button" className="secondary-button px-4 py-2 text-xs">
              View All
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
              <TrendingUp className="h-6 w-6 text-[var(--accord-muted)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--accord-text)]">No recent vault activity</p>
              <p className="mt-2 text-sm text-[var(--accord-muted)]">Deposits and withdrawals will show up here once they happen.</p>
            </div>
          </div>
        </section>

        <section className="surface-card space-y-4">
          <div>
            <p className="eyebrow">Quick actions</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Move funds with confidence</h2>
          </div>

          <button type="button" className="primary-button w-full">
            <Plus className="h-4 w-4" />
            Deposit USDC
          </button>
          <Link to="/dashboard/vault/withdraw" className="secondary-button w-full">
            <ArrowDownUp className="h-4 w-4" />
            Withdraw to Wallet
          </Link>

          <div className="surface-muted px-4 py-4">
            <p className="metric-label">Connected wallet</p>
            <p className="mt-3 break-all text-sm font-semibold text-[var(--accord-text)]">
              {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "—"}
            </p>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">Network: {networkLabel}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

