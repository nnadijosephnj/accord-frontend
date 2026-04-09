// src/components/EmailSettings.jsx
// ─────────────────────────────────────────────────────────────
// Placed inside the Settings page.
// Shows email — pre-filled if Google/Email login.
// Shows export wallet option if wallet was auto-generated.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../context/AuthContext";
import { updateUserEmail } from "../lib/supabaseHelpers";

export default function EmailSettings() {
  const { user, setUser } = useAuth();
  const activeAccount = useActiveAccount();

  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isGenerated = user?.wallet_type === "generated";

  // ── Save email ───────────────────────────────────────────────
  async function saveEmail() {
    if (!emailInput || !emailInput.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateUserEmail(activeAccount.address, emailInput);
      setUser((prev) => ({ ...prev, email: emailInput }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save email. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Export private key ───────────────────────────────────────
  // Thirdweb handles the export UI natively via their dashboard/SDK
  // This button opens Thirdweb's built-in export flow
  async function exportPrivateKey() {
    // Thirdweb's export is triggered via their UI component
    // See: https://portal.thirdweb.com/connect/in-app-wallet/export-private-key
    alert("Export flow: integrate Thirdweb's ExportLocalWallet component here");
  }

  return (
    <div className="settings-section">
      {/* ── Email Notifications ── */}
      <div className="settings-block">
        <h3 className="settings-block-title">Notification Email</h3>
        <p className="settings-block-desc">
          {user?.email
            ? "Your email is set. You'll receive alerts for all transactions."
            : "Add your email to receive transaction alerts — funded agreements, releases, disputes and more."}
        </p>

        <div className="settings-input-row">
          <input
            className="settings-input"
            type="email"
            placeholder="your@email.com"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setSaved(false);
            }}
          />
          <button
            className="settings-save-btn"
            onClick={saveEmail}
            disabled={saving || emailInput === user?.email}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>

        {error && <p className="settings-error">{error}</p>}

        <p className="settings-note">
          Your email is only used for notifications. It is never used for login.
        </p>
      </div>

      {/* ── Export Wallet (only for generated wallets) ── */}
      {isGenerated && (
        <div className="settings-block">
          <h3 className="settings-block-title">Export Your Wallet</h3>
          <p className="settings-block-desc">
            This wallet was created by Accord. You can export it and use it in any EVM wallet like MetaMask or Keplr. Your funds and agreements stay intact.
          </p>

          <div className="export-buttons">
            <button className="export-btn" onClick={exportPrivateKey}>
              🔑 Export Private Key
            </button>
            <button className="export-btn" onClick={exportPrivateKey}>
              📋 Export Seed Phrase
            </button>
          </div>

          <p className="settings-note warning">
            ⚠️ Never share your private key or seed phrase with anyone — including Accord.
          </p>
        </div>
      )}

      {/* ── Wallet Info ── */}
      <div className="settings-block">
        <h3 className="settings-block-title">Wallet Address</h3>
        <div className="wallet-address-display">
          {activeAccount?.address
            ? `${activeAccount.address.slice(0, 8)}...${activeAccount.address.slice(-6)}`
            : "No wallet connected"}
        </div>
        <p className="settings-note">
          {isGenerated
            ? "Auto-created wallet · Fully owned by you"
            : "External wallet · " + (user?.login_method === "wallet" ? "Connected directly" : "Connected after login")}
        </p>
      </div>
    </div>
  );
}
