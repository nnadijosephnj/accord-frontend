// src/pages/AuthPage.jsx
// ─────────────────────────────────────────────────────────────
// The login screen. Two paths:
// Path A → Connect Wallet (Keplr / MetaMask)
// Path B → Google or Email login → then WalletPrompt
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useConnect,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import {
  createWallet,
  inAppWallet,
  preAuthenticate,
} from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";
import { upsertUser } from "../lib/supabaseHelpers";
import WalletPrompt from "../components/WalletPrompt";

const METAMASK_DOWNLOAD = "https://metamask.io/download/";
const KEPLR_DOWNLOAD = "https://www.keplr.app/download";

export default function AuthPage() {
  const navigate = useNavigate();
  const { connect } = useConnect();
  const activeAccount = useActiveAccount();

  // 'login' | 'otp' | 'wallet-prompt'
  const [step, setStep] = useState("login");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [socialEmail, setSocialEmail] = useState("");  // email from Google/OTP
  const [loginMethod, setLoginMethod] = useState("");  // 'google' | 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Path A: Connect external wallet directly ─────────────────
  async function connectWallet(walletId) {
    setError("");
    setLoading(true);
    try {
      await connect(async () => {
        const wallet = createWallet(walletId);
        await wallet.connect({ client, chain: injectiveTestnet });
        return wallet;
      });

      const address = activeAccount?.address;
      if (!address) throw new Error("Address not found after connect");

      await upsertUser({
        walletAddress: address,
        email: null,
        loginMethod: "wallet",
        walletType: "external",
      });

      navigate("/dashboard");
    } catch (err) {
      if (
        err.message?.includes("not installed") ||
        err.message?.includes("No provider") ||
        err.message?.includes("not found")
      ) {
        const url = walletId === "io.metamask" ? METAMASK_DOWNLOAD : KEPLR_DOWNLOAD;
        window.open(url, "_blank");
        setError("Wallet not found. Download page opened in a new tab.");
      } else {
        setError(err.message || "Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Path B Step 1: Google login ──────────────────────────────
  async function loginWithGoogle() {
    setError("");
    setLoading(true);
    try {
      // We use inAppWallet to get the Google identity
      // This gives us their email but does NOT create the wallet yet
      // Wallet creation happens in WalletPrompt
      const wallet = inAppWallet();
      const googleAccount = await wallet.connect({
        client,
        chain: injectiveTestnet,
        strategy: "google",
      });

      // Get email from the authenticated session
      const email = googleAccount?.email || "";
      setSocialEmail(email);
      setLoginMethod("google");
      setStep("wallet-prompt");
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Path B Step 1: Email OTP — send code ─────────────────────
  async function sendOtp() {
    if (!emailInput || !emailInput.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await preAuthenticate({
        client,
        strategy: "email",
        email: emailInput,
      });
      setLoginMethod("email");
      setSocialEmail(emailInput);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // ── Path B Step 2: Email OTP — verify code ───────────────────
  async function verifyOtp() {
    if (!otpInput || otpInput.length < 4) {
      setError("Please enter the code sent to your email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const wallet = inAppWallet();
      await wallet.connect({
        client,
        chain: injectiveTestnet,
        strategy: "email",
        email: socialEmail,
        verificationCode: otpInput,
      });
      // OTP verified — go to wallet prompt
      setStep("wallet-prompt");
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── After wallet is connected/created in WalletPrompt ────────
  function handleWalletComplete(address) {
    navigate("/dashboard");
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  // Step: Wallet Prompt (after Google or Email verified)
  if (step === "wallet-prompt") {
    return (
      <div className="auth-wrapper">
        <WalletPrompt
          email={socialEmail}
          loginMethod={loginMethod}
          onComplete={handleWalletComplete}
        />
      </div>
    );
  }

  // Step: OTP Entry
  if (step === "otp") {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">Accord</div>
          <h2>Check your email</h2>
          <p className="auth-sub">
            We sent a code to <strong>{socialEmail}</strong>
          </p>

          {error && <div className="auth-error">{error}</div>}

          <input
            className="auth-input"
            type="text"
            placeholder="Enter code"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            maxLength={8}
          />

          <button className="auth-btn primary" onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying…" : "Verify Code"}
          </button>

          <button
            className="auth-btn ghost"
            onClick={() => { setStep("login"); setError(""); }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step: Main Login Screen
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">Accord</div>
        <p className="auth-tagline">Decentralized escrow for freelancers</p>

        {error && <div className="auth-error">{error}</div>}

        {/* ── PATH A: Connect Wallet ── */}
        <div className="auth-section">
          <div className="auth-section-label">Connect your wallet</div>
          <button
            className="wallet-connect-btn keplr"
            onClick={() => connectWallet("app.keplr")}
            disabled={loading}
          >
            <img src="/icons/keplr.svg" alt="Keplr" />
            Connect with Keplr
          </button>
          <button
            className="wallet-connect-btn metamask"
            onClick={() => connectWallet("io.metamask")}
            disabled={loading}
          >
            <img src="/icons/metamask.svg" alt="MetaMask" />
            Connect with MetaMask
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider"><span>or</span></div>

        {/* ── PATH B: Google ── */}
        <button
          className="auth-btn google"
          onClick={loginWithGoogle}
          disabled={loading}
        >
          <img src="/icons/google.svg" alt="Google" />
          Continue with Google
        </button>

        {/* ── PATH B: Email OTP ── */}
        <div className="auth-email-row">
          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendOtp()}
          />
          <button
            className="auth-btn primary"
            onClick={sendOtp}
            disabled={loading || !emailInput}
          >
            {loading ? "Sending…" : "Continue"}
          </button>
        </div>

        <p className="auth-footnote">
          All values are in USD · Powered by USDC on Injective
        </p>
      </div>
    </div>
  );
}
