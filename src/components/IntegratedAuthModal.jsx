import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
import { upsertUserByWallet } from "../lib/supabaseHelpers";
import { client } from "../lib/thirdwebClient";
import { clearPendingWalletType, setPendingWalletType } from "../lib/walletAuthState";

const flowVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function IntegratedAuthModal({ isOpen, onClose, onComplete }) {
  const { closeAuthModal } = useAuth();
  const { currentChain, currentConfig } = useNetwork();
  const { connect, isConnecting } = useConnectModal();
  const [step, setStep] = useState("CHOICE");
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

      if (onComplete) onComplete();
      else closeAuthModal();
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

      if (onComplete) onComplete();
      else closeAuthModal();
    } catch (err) {
      console.error("External connect error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      <Motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative flex min-h-[460px] w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 z-20 text-zinc-500 transition-colors hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex flex-grow flex-col justify-center p-10">
          <AnimatePresence mode="wait" custom={direction}>
            {step === "CHOICE" && (
              <Motion.div
                key="choice"
                custom={direction}
                variants={flowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                    <Wallet className="h-8 w-8 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Sign In</h2>
                  <p className="mt-1 text-sm text-zinc-500">Choose how to connect to Accord</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">
                    {currentConfig.label} network
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="connect-wallet-wrapper overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-orange-500/40">
                    <ConnectButton
                      client={client}
                      chain={currentChain}
                      hiddenWallets={["inApp", "embedded"]}
                      showAllWallets={true}
                      theme="dark"
                      connectModal={{
                        title: "Connect to Accord",
                        size: "compact",
                        showThirdwebBranding: false,
                      }}
                      onConnect={handleExternalConnect}
                      connectButton={{
                        label: (
                          <span className="flex items-center gap-3">
                            <Wallet className="h-5 w-5" />
                            <span className="font-black uppercase tracking-wide">Connect Wallet</span>
                          </span>
                        ),
                        style: {
                          width: "100%",
                          padding: "20px 24px",
                          borderRadius: "1rem",
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          fontSize: "15px",
                          border: "none",
                          cursor: "pointer",
                        },
                      }}
                    />
                  </div>

                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      <span className="bg-[#0a0a0a] px-4">OR</span>
                    </div>
                  </div>

                  <button
                    onClick={() => next("CREATE_INFO")}
                    className="group relative w-full overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-600/20 to-orange-500/5 p-6 text-left transition-all hover:border-orange-500/50"
                  >
                    <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition-colors group-hover:bg-orange-500/20" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 transition-transform group-hover:scale-110">
                        <Sparkles className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wide text-white">Create Wallet</h4>
                        <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                          No extension needed - secure wallet generation
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </Motion.div>
            )}

            {step === "CREATE_INFO" && (
              <Motion.div
                key="info"
                custom={direction}
                variants={flowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <button
                  onClick={() => back("CHOICE")}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-500 transition-colors hover:text-white"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                    <ShieldCheck className="h-7 w-7 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-black uppercase text-white">Before We Begin</h2>
                  <p className="mt-1 text-xs text-zinc-500">Here&apos;s what creating a wallet means</p>
                </div>

                <div className="space-y-3 rounded-2xl bg-white/[0.03] p-5 text-[11px] leading-relaxed text-zinc-400">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 shrink-0 text-orange-500" size={16} />
                    <p>
                      <b className="text-white">Real EVM Wallet:</b> Accord will generate a real EVM wallet for you that works on Injective EVM and all EVM chains.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Fingerprint className="mt-0.5 shrink-0 text-orange-500" size={16} />
                    <p>
                      <b className="text-white">Fully Yours:</b> This wallet is 100% yours. Accord does not control it, and the key material is protected inside secure enclave infrastructure.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download className="mt-0.5 shrink-0 text-emerald-500" size={16} />
                    <p>
                      <b className="text-white">Export Anytime:</b> You can export your private key or recovery material from Settings, then import it into MetaMask, Keplr, or another EVM wallet.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 shrink-0 text-blue-500" size={16} />
                    <p>
                      <b className="text-white">Recovery:</b> Thirdweb secures the generated wallet using the same email or Google account you choose in its wallet flow.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ExternalLink className="mt-0.5 shrink-0 text-purple-500" size={16} />
                    <p>
                      <b className="text-white">Want your own?</b> You can skip this, create your own wallet on MetaMask or Keplr, and come back to connect it with the wallet picker.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleCreateWallet}
                    disabled={isLoading || isConnecting}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] disabled:opacity-60"
                  >
                    {isLoading || isConnecting ? "Opening Secure Flow..." : "Create My Wallet"}
                  </button>
                  <button
                    onClick={() => back("CHOICE")}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                  >
                    I&apos;ll connect my own wallet
                  </button>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-center text-[10px] font-black uppercase text-red-500">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800">
            Accord Trust Execution Framework v2.0
          </p>
        </div>
      </Motion.div>
    </div>
  );
}
