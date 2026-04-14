import React, { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Link as LinkIcon,
  Moon,
  RefreshCw,
  Send,
  Sun,
  User,
} from "lucide-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { USDC_ADDRESS } from "../utils/contractABI";
import { apiCall } from "../utils/api";

export default function CreateClient() {
  const { address } = useWallet();
  const { isDark, toggle } = useTheme();
  const [loading, setLoading] = useState(false);
  const [pasteLink, setPasteLink] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    freelancerAddress: "",
    amount: "",
    tokenAddress: USDC_ADDRESS,
    deadline: "",
  });

  const handlePasteSubmit = (event) => {
    event.preventDefault();

    try {
      const url = new URL(pasteLink);
      const id = url.pathname.split("/").pop();
      navigate(`/deal/${id}`);
    } catch {
      navigate(`/deal/${pasteLink}`);
    }
  };

  const handleCreateSubmit = async (event) => {
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
          client_wallet: address.toLowerCase(),
          freelancer_wallet: form.freelancerAddress.toLowerCase(),
          amount: form.amount,
          token_address: form.tokenAddress,
          max_revisions: 3,
          deadline: form.deadline,
          contract_agreement_id: contractAgreementId,
          status: "PENDING",
        }),
      });

      navigate(`/deal/${agreement.id}`);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-[var(--accord-background)] pb-12 text-[var(--accord-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
        <div className="page-shell flex items-center justify-between px-4 py-4 sm:px-6">
          <button type="button" onClick={() => navigate("/dashboard")} className="icon-button h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="eyebrow">Legacy flow</p>
            <h1 className="mt-2 text-lg font-semibold text-[var(--accord-primary)]">Create as Client</h1>
          </div>

          <button type="button" onClick={toggle} className="icon-button h-10 w-10" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="page-shell px-4 pt-8 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="surface-card">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                <LinkIcon className="h-5 w-5 text-[var(--accord-primary)]" />
              </div>
              <div className="flex-1">
                <p className="eyebrow">Option A</p>
                <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Open a link from a freelancer</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                  If a freelancer already sent you an Accord link, paste it here to jump straight into the agreement room.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasteSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                className="field-input flex-1 font-mono"
                placeholder="Paste agreement link here"
                value={pasteLink}
                onChange={(event) => setPasteLink(event.target.value)}
              />
              <button type="submit" className="primary-button sm:self-start">
                Open Link
              </button>
            </form>
          </section>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--accord-border)]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--accord-border)]" />
          </div>

          <section className="surface-card">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                <Briefcase className="h-5 w-5 text-[var(--accord-primary)]" />
              </div>
              <div className="flex-1">
                <p className="eyebrow">Option B</p>
                <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Create and invite a freelancer</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                  Define the work, amount, and freelancer wallet, then create the agreement and share it.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="field-label">Job title</span>
                <input
                  required
                  className="field-input"
                  placeholder="Website redesign for client"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>

              <label className="block space-y-2">
                <span className="field-label">Description</span>
                <textarea
                  required
                  rows="4"
                  className="field-textarea resize-none"
                  placeholder="Describe the work, deliverables, and approval terms"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>

              <label className="block space-y-2">
                <span className="field-label">Freelancer wallet address</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
                  <input
                    required
                    className="field-input pl-11 font-mono"
                    placeholder="0x..."
                    value={form.freelancerAddress}
                    onChange={(event) => setForm({ ...form, freelancerAddress: event.target.value })}
                  />
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="block space-y-2">
                  <span className="field-label">Payment amount</span>
                  <input
                    required
                    type="number"
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

              <label className="block space-y-2">
                <span className="field-label">Deadline</span>
                <input
                  type="date"
                  className="field-input"
                  value={form.deadline}
                  onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                />
              </label>

              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Creating Agreement" : "Create and Send"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}


