import React, { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Fingerprint,
  Globe,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { ConnectButton, useConnectModal } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "../context/NetworkContext";
import { useTheme } from "../context/ThemeContext";
import { clearPendingWalletType, setPendingWalletType } from "../lib/walletAuthState";
import { upsertUserByWallet } from "../lib/supabaseHelpers";
import { client } from "../lib/thirdwebClient";

const flowVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction < 0 ? 28 : -28 }),
};

export default function IntegratedAuthModal({ isOpen, onClose, onComplete }) {
  const { authModal, closeAuthModal } = useAuth();
  const { currentChain, currentConfig } = useNetwork();
  const { isDark } = useTheme();
  const { connect, isConnecting } = useConnectModal();
  const [step, setStep] = useState("CHOICE");
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep(authModal?.step || "CHOICE");
    setDirection(1);
    setError(null);
  }, [authModal?.step, isOpen]);

  const next = (value) => {
    setDirection(1);
    setStep(value);
    setError(null);
  };

  const back = (value) => {
    setDirection(-1);
    setStep(value);
    setError(null);
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    setPendingWalletType("generated");

    try {
      const generatedWallet = inAppWallet({
        auth: {
          options: ["email", "google"],
        },
      });

      const wallet = await connect({
        client,
        chain: currentChain,
        wallets: [generatedWallet],
        recommendedWallets: [generatedWallet],
        showAllWallets: false,
        size: "compact",
        title: "Create Your Accord Wallet",
        showThirdwebBranding: false,
      });

      const account = wallet?.getAccount();

      if (account?.address) {
        await upsertUserByWallet({
          walletAddress: account.address,
          walletType: "generated",
        });
      }

      if (onComplete) {
        onComplete();
      } else {
        closeAuthModal();
      }
    } catch (err) {
      clearPendingWalletType();
      console.error("Create wallet error:", err);
      setError(err?.message || "Wallet creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalConnect = async (wallet) => {
    try {
      const account = wallet.getAccount();

      if (account?.address) {
        await upsertUserByWallet({
          walletAddress: account.address,
          walletType: "external",
        });
      }

      if (onComplete) {
        onComplete();
      } else {
        closeAuthModal();
      }
    } catch (err) {
      console.error("External connect error:", err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <Motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--accord-backdrop)] backdrop-blur-[12px]"
        aria-label="Close sign in modal"
      />

      <Motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="glass-modal relative z-10 flex min-h-[480px] w-full max-w-[560px] flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between border-b border-[var(--accord-border-soft)] px-6 py-5 sm:px-8">
          <div>
            <p className="eyebrow">Access</p>
            <h2 className="mt-2 text-[28px] font-bold leading-tight text-[var(--accord-text)]">Sign in to Accord</h2>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">Choose a wallet path that fits how you want to work.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button h-10 w-10"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between px-6 py-6 sm:px-8">
          <AnimatePresence mode="wait" custom={direction}>
            {step === "CHOICE" ? (
              <Motion.div
                key="choice"
                custom={direction}
                variants={flowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="surface-card">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow">Network</p>
                      <p className="mt-2 text-base font-semibold text-[var(--accord-text)]">{currentConfig.label}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                      <Wallet className="h-5 w-5 text-[var(--accord-primary)]" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[10px] border border-[var(--accord-border)]">
                      <ConnectButton
                        client={client}
                        chain={currentChain}
                        hiddenWallets={["inApp", "embedded"]}
                        showAllWallets
                        theme={isDark ? "dark" : "light"}
                        connectModal={{
                          title: "Connect to Accord",
                          size: "compact",
                          showThirdwebBranding: false,
                        }}
                        onConnect={handleExternalConnect}
                        connectButton={{
                          label: (
                            <span className="flex items-center gap-3">
                              <Wallet className="h-4 w-4" />
                              <span>Connect Wallet</span>
                            </span>
                          ),
                          style: {
                            width: "100%",
                            border: "none",
                            borderRadius: "10px",
                            padding: "14px 18px",
                            background: "var(--accord-surface)",
                            color: "var(--accord-text)",
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: "14px",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            justifyContent: "flex-start",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--accord-border)]" />
                      <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">or</span>
                      <div className="h-px flex-1 bg-[var(--accord-border)]" />
                    </div>

                    <button
                      type="button"
                      onClick={() => next("CREATE_INFO")}
                      className="secondary-button w-full justify-start border-[var(--accord-primary-line)] bg-[var(--accord-primary-faint)] text-[var(--accord-text)] hover:bg-[var(--accord-primary-soft)]"
                    >
                      <Sparkles className="h-4 w-4 text-[var(--accord-primary)]" />
                      Create Wallet
                    </button>
                  </div>
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                key="create-info"
                custom={direction}
                variants={flowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <button type="button" onClick={() => back("CHOICE")} className="secondary-button self-start px-4 py-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="surface-card space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                      <ShieldCheck className="h-5 w-5 text-[var(--accord-primary)]" />
                    </div>
                    <div>
                      <p className="eyebrow">Generated wallet</p>
                      <h3 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Before you continue</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--accord-muted)]">
                        Accord can create a secure wallet for you without a browser extension.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        icon: Sparkles,
                        title: "Real EVM wallet",
                        description:
                          "Your wallet works on Injective EVM and other EVM-compatible networks.",
                      },
                      {
                        icon: Fingerprint,
                        title: "You stay in control",
                        description:
                          "Accord does not custody your funds or control the underlying key material.",
                      },
                      {
                        icon: Download,
                        title: "Export anytime",
                        description:
                          "You can move the wallet into MetaMask, Keplr, or another EVM wallet later.",
                      },
                      {
                        icon: Globe,
                        title: "Account recovery",
                        description:
                          "Recovery is tied to the email or Google sign-in used during setup.",
                      },
                      {
                        icon: ExternalLink,
                        title: "External wallets still work",
                        description:
                          "If you prefer your own wallet, go back and use the wallet picker instead.",
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="surface-muted flex items-start gap-3 px-4 py-4">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accord-primary-soft)]">
                            <Icon className="h-4 w-4 text-[var(--accord-primary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--accord-text)]">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-[var(--accord-muted)]">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleCreateWallet}
                      disabled={isLoading || isConnecting}
                      className="primary-button w-full"
                    >
                      {isLoading || isConnecting ? "Opening Secure Flow" : "Create My Wallet"}
                    </button>
                    <button type="button" onClick={() => back("CHOICE")} className="secondary-button w-full">
                      I Will Use My Own Wallet
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {error ? <p className="mt-4 text-sm font-medium text-[var(--accord-danger)]">{error}</p> : null}
        </div>

        <div className="border-t border-[var(--accord-border-soft)] px-6 py-4 sm:px-8">
          <p className="text-[12px] text-[var(--accord-muted)]">Secure wallet access powered by Thirdweb.</p>
        </div>
      </Motion.div>
    </div>
  );
}



