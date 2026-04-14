import React, { useEffect, useState } from "react";
import { Briefcase, ChevronDown, DollarSign, Plus, Trash2, User, Wallet } from "lucide-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { getAddressBookEntries } from "../../lib/supabaseHelpers";
import { USDC_ADDRESS } from "../../utils/contractABI";
import { apiCall } from "../../utils/api";

const WORK_TYPES = [
  "Graphics Design",
  "Video Editing",
  "Music Production",
  "Photography",
  "Copywriting",
  "UI/UX Design",
  "Web Development",
  "Other",
];

export default function CreateAgreement() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundingSource, setFundingSource] = useState("vault");
  const [addressBook, setAddressBook] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState("");

  const [form, setForm] = useState({
    title: "",
    workType: "Graphics Design",
    counterpartyAddress: "",
  });

  const [items, setItems] = useState([{ name: "", description: "", amount: "" }]);

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  useEffect(() => {
    if (!address) {
      return;
    }

    let mounted = true;

    const loadAddressBook = async () => {
      try {
        const entries = await getAddressBookEntries(address);
        if (mounted) {
          setAddressBook(entries);
        }
      } catch (error) {
        console.error("Failed to load address book:", error);
      }
    };

    loadAddressBook();

    return () => {
      mounted = false;
    };
  }, [address]);

  const addItem = () => setItems((current) => [...current, { name: "", description: "", amount: "" }]);
  const removeItem = (index) => setItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const updateItem = (index, key, value) =>
    setItems((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, [key]: value } : item)));

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const contractAgreementId = ethers.hexlify(ethers.randomBytes(32));
      const isFreelancer = role === "freelancer";

      const agreement = await apiCall("/api/agreements", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: items.map((item) => `${item.name}: ${item.description}`).join("\n"),
          client_wallet: isFreelancer ? form.counterpartyAddress.toLowerCase() : address.toLowerCase(),
          freelancer_wallet: isFreelancer ? address.toLowerCase() : form.counterpartyAddress.toLowerCase(),
          amount: totalAmount.toFixed(2),
          token_address: USDC_ADDRESS,
          max_revisions: 3,
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

  if (step === 1) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="page-title">Create Agreement</h1>
          <p className="page-subtitle">Start by choosing whether you are setting this agreement up as the freelancer or the client.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              key: "freelancer",
              title: "As freelancer",
              description: "You are providing the work and will receive payment once approved.",
              icon: User,
            },
            {
              key: "client",
              title: "As client",
              description: "You are funding the agreement and reviewing the final submission.",
              icon: Briefcase,
            },
          ].map((option) => {
            const Icon = option.icon;
            const selected = role === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setRole(option.key)}
                className={`surface-card text-left ${selected ? "border-[var(--accord-primary-hover-line)] bg-[var(--accord-primary-soft)]" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                  <Icon className={`h-5 w-5 ${selected ? "text-[var(--accord-primary)]" : "text-[var(--accord-muted)]"}`} />
                </div>
                <h2 className="mt-6 text-[18px] font-semibold text-[var(--accord-text)]">{option.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">{option.description}</p>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => role && setStep(2)} disabled={!role} className="primary-button w-full">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <button type="button" onClick={() => setStep(1)} className="secondary-button px-4 py-2 text-xs">
          Back
        </button>
        <div>
          <h1 className="page-title">{role === "freelancer" ? "Create Freelancer Agreement" : "Create Client Agreement"}</h1>
          <p className="page-subtitle">Set the counterparty, define the work items, and confirm the total escrow amount.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="surface-card space-y-4">
          <div>
            <p className="eyebrow">Agreement details</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Basic information</h2>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="field-label">Agreement title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Logo design for TechBrand"
                className="field-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="field-label">Work type</span>
              <div className="relative">
                <select
                  value={form.workType}
                  onChange={(event) => setForm((current) => ({ ...current, workType: event.target.value }))}
                  className="field-select pr-10"
                >
                  {WORK_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="field-label">{role === "freelancer" ? "Client wallet address" : "Freelancer wallet address"}</span>
              {addressBook.length ? (
                <div className="relative">
                  <select
                    value={selectedSavedAddress}
                    onChange={(event) => {
                      setSelectedSavedAddress(event.target.value);
                      setForm((current) => ({ ...current, counterpartyAddress: event.target.value }));
                    }}
                    className="field-select pr-10"
                  >
                    <option value="">Select from address book</option>
                    {addressBook.map((entry) => (
                      <option key={entry.id} value={entry.saved_address}>
                        {entry.nickname} - {entry.saved_address.slice(0, 6)}...{entry.saved_address.slice(-4)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
                </div>
              ) : null}
              <div className="relative">
                <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
                <input
                  required
                  value={form.counterpartyAddress}
                  onChange={(event) => {
                    setSelectedSavedAddress("");
                    setForm((current) => ({ ...current, counterpartyAddress: event.target.value }));
                  }}
                  placeholder="0x..."
                  className="field-input pl-11"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="surface-card space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Work items</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Scope and pricing</h2>
            </div>
            <button type="button" onClick={addItem} className="secondary-button px-4 py-2 text-xs">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`item-${index}`} className="surface-muted space-y-4 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="field-label">Item {index + 1}</p>
                  {items.length > 1 ? (
                    <button type="button" onClick={() => removeItem(index)} className="destructive-button px-3 py-2 text-xs">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>

                <label className="block space-y-2">
                  <span className="field-label">Item name</span>
                  <input
                    required
                    value={item.name}
                    onChange={(event) => updateItem(index, "name", event.target.value)}
                    placeholder="Primary logo package"
                    className="field-input"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="field-label">Description</span>
                  <textarea
                    rows="3"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                    placeholder="Describe what will be delivered for this line item"
                    className="field-textarea"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="field-label">Amount</span>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accord-muted)]" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(event) => updateItem(index, "amount", event.target.value)}
                      placeholder="0.00"
                      className="field-input pl-11"
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card space-y-4">
          <div>
            <p className="eyebrow">Funding</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Review the total</h2>
          </div>

          <div className="metric-card-primary">
            <p className="metric-label">Escrow total</p>
            <p className="metric-value-primary mt-4">${totalAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            {[
              { key: "vault", label: "From vault", description: "Use your available Accord balance." },
              { key: "keplr", label: "Direct from wallet", description: "Pull funds from the connected wallet when funding." },
            ].map((option) => {
              const selected = fundingSource === option.key;

              return (
                <label
                  key={option.key}
                  className={`surface-muted flex cursor-pointer items-start gap-3 px-4 py-4 ${selected ? "border-[var(--accord-primary-hover-line)] bg-[var(--accord-primary-soft)]" : ""}`}
                >
                  <input
                    type="radio"
                    name="funding"
                    value={option.key}
                    checked={selected}
                    onChange={() => setFundingSource(option.key)}
                    className="mt-1 accent-[var(--accord-primary)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--accord-text)]">{option.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--accord-muted)]">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <button type="submit" disabled={loading} className="primary-button w-full">
          {loading ? "Creating Agreement" : "Create Agreement"}
        </button>
      </form>
    </div>
  );
}


