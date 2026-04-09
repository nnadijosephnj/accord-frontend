// src/components/WalletOwnershipInfo.jsx
// ─────────────────────────────────────────────────────────────
// Shown when user clicks "Auto-Create Wallet with Accord"
// Explains ownership clearly before wallet is created
// ─────────────────────────────────────────────────────────────

export default function WalletOwnershipInfo({ onConfirm, onBack, loading }) {
  const points = [
    {
      icon: "🔑",
      title: "You own this wallet 100%",
      desc: "Accord never controls your wallet. The private key belongs only to you.",
    },
    {
      icon: "🔒",
      title: "Nobody can access it but you",
      desc: "Your wallet is created inside a secure enclave. Even Thirdweb never holds your full key.",
    },
    {
      icon: "📤",
      title: "Export anytime",
      desc: "You can export your private key or seed phrase from Settings at any time and import it into MetaMask or Keplr.",
    },
    {
      icon: "📱",
      title: "Works on any device",
      desc: "Lost your phone? Just log in again with Google or Email — your wallet is automatically restored.",
    },
    {
      icon: "🚪",
      title: "Always an exit",
      desc: "If Accord ever shuts down, your wallet and funds still exist. Export your key and use any EVM wallet.",
    },
  ];

  return (
    <div className="ownership-info">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h2>Your Wallet, Your Rules</h2>
      <p className="subtitle">
        Accord will create a wallet for you. Here's exactly what that means:
      </p>

      <div className="points-list">
        {points.map((p, i) => (
          <div className="point" key={i}>
            <span className="point-icon">{p.icon}</span>
            <div>
              <div className="point-title">{p.title}</div>
              <div className="point-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="confirm-btn"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Creating your wallet…" : "Create My Wallet"}
      </button>

      <p className="footnote">
        Powered by Thirdweb · All values are in USD · Settled in USDC on Injective
      </p>
    </div>
  );
}
