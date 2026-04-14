import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Moon,
  RefreshCw,
  Sun,
  Wallet,
} from "lucide-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { USDC_ADDRESS } from "../utils/contractABI";
import { apiCall } from "../utils/api";

export default function CreateFreelancer() {
  const { address } = useWallet();
  const { isDark, toggle } = useTheme();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    clientAddress: "",
    amount: "",
    tokenAddress: USDC_ADDRESS,
    maxRevisions: 3,
    deadline: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!address) {
        throw new Error("Connect a wallet before creating an agreement");
      }

      setLoading(true);
      const contractAgreementId = ethers.hexlify(ethers.randomBytes(32));

      const agreement = await apiCall("/api/agreements", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          client_wallet: form.clientAddress.toLowerCase(),
          freelancer_wallet: address.toLowerCase(),
          amount: form.amount,
          token_address: form.tokenAddress,
          max_revisions: form.maxRevisions,
          deadline: form.deadline,
          contract_agreement_id: contractAgreementId,
          status: "PENDING",
        }),
      });

      setSuccessData(agreement);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/deal/${successData?.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hi, I've created our agreement on Accord for "${form.title}". Please review and fund it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (successData) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-[var(--accord-background)] px-4 py-10 text-[var(--accord-text)] sm:px-6">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <Motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="surface-card"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.12)]">
              <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
            </div>

            <h1 className="mt-6 text-[28px] font-bold leading-tight text-[var(--accord-text)]">Agreement created</h1>
            <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
              Your agreement is ready. Share the link with your client so they can review and fund it.
            </p>

            <div className="mt-6 rounded-[10px] border border-[var(--accord-border)] bg-[var(--accord-input-background)] px-4 py-4 text-left">
              <p className="field-label">Share link</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex-1 truncate text-sm text-[var(--accord-text)] font-mono">{shareUrl}</span>
                <button type="button" onClick={handleCopy} className="icon-button h-10 w-10">
                  {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleWhatsApp} className="secondary-button flex-1">
                <MessageCircle className="h-4 w-4" />
                Share on WhatsApp
              </button>
              <button type="button" onClick={() => navigate(`/deal/${successData.id}`)} className="primary-button flex-1">
                Go to Agreement Room
              </button>
            </div>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[var(--accord-background)] pb-12 text-[var(--accord-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
        <div className="page-shell flex items-center justify-between px-4 py-4 sm:px-6">
          <button type="button" onClick={() => navigate("/dashboard")} className="icon-button h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="eyebrow">Legacy flow</p>
            <h1 className="mt-2 text-lg font-semibold text-[var(--accord-primary)]">Create as Freelancer</h1>
          </div>

          <button type="button" onClick={toggle} className="icon-button h-10 w-10" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="page-shell px-4 pt-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="surface-card space-y-4">
              <div>
                <p className="eyebrow">Agreement setup</p>
                <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Project details</h2>
              </div>

              <label className="block space-y-2">
                <span className="field-label">Job title</span>
                <input
                  required
                  className="field-input"
                  placeholder="Logo design for TechBrand"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>

              <label className="block space-y-2">
                <span className="field-label">Deliverables description</span>
                <textarea
                  required
                  rows="4"
                  className="field-textarea resize-none"
                  placeholder="Describe exactly what will be delivered and how approval should work"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>

              <label className="block space-y-2">
                <span className="field-label">Client wallet address</span>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
                  <input
                    required
                    className="field-input pl-11 font-mono"
                    placeholder="0x..."
                    value={form.clientAddress}
                    onChange={(event) => setForm({ ...form, clientAddress: event.target.value })}
                  />
                </div>
                <p className="text-xs text-[var(--accord-muted)]">Only this wallet address will be able to fund and approve the agreement.</p>
              </label>
            </section>

            <section className="surface-card space-y-4">
              <div>
                <p className="eyebrow">Payment terms</p>
                <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Pricing and revisions</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="block space-y-2">
                  <span className="field-label">Payment amount</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="field-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="field-label">Token</span>
                  <select
                    className="field-select min-w-[140px]"
                    value={form.tokenAddress}
                    onChange={(event) => setForm({ ...form, tokenAddress: event.target.value })}
                  >
                    <option value={USDC_ADDRESS}>USDC</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <span className="field-label">Max revisions</span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setForm({ ...form, maxRevisions: count })}
                      className={
                        form.maxRevisions === count
                          ? "primary-button px-0 py-3 text-xs"
                          : "secondary-button px-0 py-3 text-xs"
                      }
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="field-label">Deadline</span>
                <input
                  type="date"
                  className="field-input"
                  value={form.deadline}
                  onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                />
              </label>
            </section>

            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating Share Link" : "Create and Share Link"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

