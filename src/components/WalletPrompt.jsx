// src/components/WalletPrompt.jsx
// ─────────────────────────────────────────────────────────────
// Shown after Google or Email login.
// User must connect or create a wallet to proceed.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  useConnect,
  useActiveAccount,
} from "thirdweb/react";
import {
  createWallet,
  inAppWallet,
} from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { upsertUser } from "../lib/supabaseHelpers";
import WalletOwnershipInfo from "./WalletOwnershipInfo";

const METAMASK_DOWNLOAD = "https://metamask.io/download/";
const KEPLR_DOWNLOAD = "https://www.keplr.app/download";

export default function WalletPrompt({ email, loginMethod, onComplete }) {
  const { connect } = useConnect();
  const activeAccount = useActiveAccount();

  // 'choose' | 'ownership' | 'connecting'
  const [step, setStep] = useState("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Connect external wallet (MetaMask or Keplr) ─────────────
  async function connectExternalWallet(walletId) {
    setError("");
    setLoading(true);
    try {
      await connect(async () => {
        const wallet = createWallet(walletId); // e.g. "io.metamask" or "app.keplr"
        await wallet.connect({ client, chain: injectiveTestnet });
        return wallet;
      });

      const address = activeAccount?.address;
      if (!address) throw new Error("Wallet connected but address not found");

      await upsertUser({
        walletAddress: address,
        email: email || null,
        loginMethod,
        walletType: "external",
      });

      onComplete(address);
    } catch (err) {
      // If wallet not installed — redirect to download
      if (
        err.message?.includes("not installed") ||
        err.message?.includes("not found") ||
        err.message?.includes("No provider")
      ) {
        const url = walletId === "io.metamask" ? METAMASK_DOWNLOAD : KEPLR_DOWNLOAD;
        window.open(url, "_blank");
        setError("Wallet not detected. Opening download page…");
      } else {
        setError(err.message || "Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Auto-create wallet with Thirdweb ─────────────────────────
  async function createAutoWallet() {
    setError("");
    setLoading(true);
    try {
      await connect(async () => {
        // inAppWallet uses the already-authenticated Google/Email session
        const wallet = inAppWallet();
        await wallet.connect({
          client,
          chain: injectiveTestnet,
          strategy: loginMethod === "google" ? "google" : "email",
        });
        return wallet;
      });

      const address = activeAccount?.address;
      if (!address) throw new Error("Wallet created but address not found");

      await upsertUser({
        walletAddress: address,
        email: email || null,
        loginMethod,
        walletType: "generated",
      });

      onComplete(address);
    } catch (err) {
      setError(err.message || "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  }

  // ── Ownership info screen (before auto-create) ───────────────
  if (step === "ownership") {
    return (
      <WalletOwnershipInfo
        onConfirm={createAutoWallet}
        onBack={() => setStep("choose")}
        loading={loading}
      />
    );
  }

  // ── Main choice screen ───────────────────────────────────────
  return (
    <div className="wallet-prompt">
      <div className="wallet-prompt-icon">🔗</div>
      <h2>You need a wallet to use Accord</h2>
      <p className="subtitle">
        A wallet holds your funds and signs your agreements on-chain
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="wallet-options">
        {/* ── Option 1: Connect own wallet ── */}
        <div className="wallet-section">
          <div className="section-label">I already have a wallet</div>
          <div className="wallet-buttons">
            <button
              className="wallet-btn"
              onClick={() => connectExternalWallet("app.keplr")}
              disabled={loading}
            >
              <img src="/icons/keplr.svg" alt="Keplr" />
              Connect Keplr
            </button>
            <button
              className="wallet-btn"
              onClick={() => connectExternalWallet("io.metamask")}
              disabled={loading}
            >
              <img src="/icons/metamask.svg" alt="MetaMask" />
              Connect MetaMask
            </button>
          </div>
        </div>

        <div className="or-divider">
          <span>or</span>
        </div>

        {/* ── Option 2: Auto-create wallet ── */}
        <div className="wallet-section">
          <div className="section-label">I don't have a wallet yet</div>
          <button
            className="create-wallet-btn"
            onClick={() => setStep("ownership")}
            disabled={loading}
          >
            ✨ Auto-Create Wallet with Accord
          </button>
          <p className="create-hint">
            No downloads, no seed phrases. Your wallet, fully owned by you.
          </p>
        </div>
      </div>
    </div>
  );
}
