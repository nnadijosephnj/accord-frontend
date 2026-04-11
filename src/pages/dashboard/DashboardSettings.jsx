import React, { useState } from "react";
import { CheckCircle2, Copy, FileText, Key, ShieldCheck, Wallet } from "lucide-react";
import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { client } from "../../lib/thirdwebClient";

export default function DashboardSettings() {
  const { user } = useAuth();
  const { address, logout } = useWallet();
  const activeWallet = useActiveWallet();
  const [copied, setCopied] = useState(false);

  const isGenerated = user?.wallet_type === "generated";
  const canOpenThirdwebExport = isGenerated && activeWallet?.id === "inApp";
  const createdLabel = user?.created_at
    ? new Date(user.created_at).toLocaleString()
    : "Just now";
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No wallet connected";
  const exportHint = canOpenThirdwebExport
    ? "Open Thirdweb wallet tools to reveal the private key for your generated wallet."
    : "Reconnect with your Accord-generated in-app wallet to access Thirdweb export tools.";

  const copyAddress = () => {
    if (!address) return;

    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 pb-20">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white">
            My Account
          </h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Wallet Identity on Injective
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-full bg-red-500/10 px-6 py-2 text-[10px] font-black uppercase text-red-500 transition-all hover:bg-red-500 hover:text-white"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-white/5 dark:bg-[#111111]">
            <div className="relative mb-6 inline-flex h-32 w-32 items-center justify-center rounded-[2.5rem] border-4 border-white bg-gradient-to-br from-orange-500 to-orange-700 text-3xl font-black uppercase text-white shadow-2xl dark:border-zinc-800">
              {address ? address.slice(2, 4) : "AC"}
            </div>
            <h3 className="truncate px-4 text-xl font-black uppercase italic text-zinc-900 dark:text-white">
              {shortAddress}
            </h3>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isGenerated ? "Accord-Generated Wallet" : "External Wallet"}
            </p>
          </div>

          <div className="space-y-4 rounded-[2.5rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111111]">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Active Wallet
              </p>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Wallet size={14} className="text-blue-500" />
                <span className="truncate text-xs font-bold tracking-tight">
                  {address || "No wallet connected"}
                </span>
                {address && (
                  <button onClick={copyAddress} className="text-zinc-400 transition-colors hover:text-orange-500">
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Wallet Type
              </p>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {isGenerated ? "Accord-Generated (Thirdweb In-App)" : "External (Self-Managed)"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Member Since
              </p>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{createdLabel}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-8">
          {isGenerated && (
            <div className="space-y-6 rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#111111]">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">
                  Export Your Wallet
                </h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-500">
                  This wallet was created by Accord. Use Thirdweb&apos;s wallet tools to export the generated wallet and move it into another EVM wallet whenever you want.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {canOpenThirdwebExport ? (
                  <ConnectButton
                    client={client}
                    theme="dark"
                    connectButton={{
                      style: { display: "none" },
                    }}
                    detailsButton={{
                      render: () => (
                        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-6 py-4 text-sm font-black uppercase tracking-wide text-orange-600 transition-all hover:border-orange-500/50 hover:bg-orange-500/20 dark:text-orange-400">
                          <Key size={18} />
                          Export Private Key
                        </button>
                      ),
                    }}
                    detailsModal={{
                      hideSwitchWallet: true,
                      hideSendFunds: true,
                      hideReceiveFunds: true,
                      hideBuyFunds: true,
                      showTestnetFaucet: false,
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-6 py-4 text-sm font-black uppercase tracking-wide text-orange-600/50 dark:text-orange-400/50"
                  >
                    <Key size={18} />
                    Export Private Key
                  </button>
                )}

                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-6 py-4 text-sm font-black uppercase tracking-wide text-blue-600/50 dark:text-blue-400/50"
                >
                  <FileText size={18} />
                  Export Seed Phrase
                </button>
              </div>

              <div className="space-y-2 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-0.5 text-orange-500" />
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {exportHint}
                  </p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Never share your private key or recovery material with anyone, including Accord.
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Seed phrase export is not exposed by the current Thirdweb web SDK, so that action is disabled instead of failing at runtime.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#111111] sm:p-10">
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">
                Wallet-Only Identity
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-500">
                Accord now uses your wallet address as the only identity. There is no email profile, password, or Supabase auth session tied to this account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/5 dark:bg-white/5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Identity
                </p>
                <p className="break-all text-sm font-bold text-zinc-900 dark:text-white">
                  {address || "No wallet connected"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/5 dark:bg-white/5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Storage Record
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  users.wallet_address + users.wallet_type
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
