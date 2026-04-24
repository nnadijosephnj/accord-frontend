import React, { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Fingerprint,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { ConnectButton, useConnectModal } from "thirdweb/react";
import AccordLogo from "./AccordLogo";
import { inAppWallet, createWallet } from "thirdweb/wallets";
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

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.trustwallet.app"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];

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

  // Full Brand Injection: Places the COMPLETE Logo (Icon + Wordmark) above the title
  useEffect(() => {
    if (!isOpen) return;

    const observer = new MutationObserver(() => {
      const headings = document.getElementsByTagName("h2");
      for (const h2 of headings) {
        const text = h2.textContent.trim();
        const needsBranding = (text === "Sign into Accord" || text === "Connect to Accord" || text === "Connect into Accord") && h2.getAttribute("data-branded") !== "true";
        
        if (needsBranding) {
          h2.setAttribute("data-branded", "true");
          const isConnect = text === "Connect to Accord" || text === "Connect into Accord";
          const titleText = isConnect ? "Connect your EVM-compatible wallet to get started" : "Sign into Accord";
          const titleFont = isConnect ? "'ABC Whyte', sans-serif" : "'ABC Marist', serif";
          const titleColor = isConnect ? "var(--accord-text-muted)" : "var(--accord-text)";
          const titleSize = isConnect ? "0.94rem" : "1.22rem";
          const titleWeight = isConnect ? "500" : "700";
          // 1. Rebuild header with FULL Logo + Title
          h2.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 14px; width: 100%;">
              <div style="height: 32px; width: 140px; margin-left: -4px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="50 630 1350 340" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
                  <!-- The Wordmark (Dynamic Color) -->
                  <g fill="var(--accord-text)">
                    <g transform="translate(109.064534, 838.745308)"><path d="M 128.78125 -133.359375 C 155.125 -133.359375 168.296875 -120.1875 168.296875 -93.84375 L 168.296875 -5.09375 C 168.296875 -1.695312 166.597656 0 163.203125 0 L 134.125 0 C 130.726562 0 129.03125 -1.695312 129.03125 -5.09375 L 129.03125 -17.078125 L 127.25 -17.078125 C 122.3125 -5.179688 112.453125 0.765625 97.671875 0.765625 L 49.21875 0.765625 C 38.164062 0.765625 30.085938 -1.828125 24.984375 -7.015625 C 19.890625 -12.203125 17.34375 -20.316406 17.34375 -31.359375 L 17.34375 -45.390625 C 17.34375 -56.441406 19.890625 -64.515625 24.984375 -69.609375 C 30.085938 -74.710938 38.164062 -77.265625 49.21875 -77.265625 L 129.03125 -77.265625 L 129.03125 -92.3125 C 129.03125 -97.75 127.925781 -101.613281 125.71875 -103.90625 C 123.507812 -106.207031 119.679688 -107.359375 114.234375 -107.359375 L 73.6875 -107.359375 C 69.101562 -107.359375 65.832031 -106.460938 63.875 -104.671875 C 61.914062 -102.890625 60.9375 -99.957031 60.9375 -95.875 L 60.9375 -93.578125 C 60.9375 -90.523438 59.320312 -89 56.09375 -89 L 24.984375 -89 C 21.585938 -89 19.890625 -90.695312 19.890625 -94.09375 L 19.890625 -97.671875 C 19.890625 -109.910156 22.945312 -118.914062 29.0625 -124.6875 C 35.1875 -130.46875 45.050781 -133.359375 58.65625 -133.359375 Z M 114.234375 -26.015625 C 119.679688 -26.015625 123.507812 -27.160156 125.71875 -29.453125 C 127.925781 -31.742188 129.03125 -35.613281 129.03125 -41.0625 L 129.03125 -52.28125 L 67.3125 -52.28125 C 63.914062 -52.28125 61.453125 -51.554688 59.921875 -50.109375 C 58.390625 -48.660156 57.625 -46.238281 57.625 -42.84375 L 57.625 -36.203125 C 57.625 -32.460938 58.429688 -29.828125 60.046875 -28.296875 C 61.660156 -26.773438 64.335938 -26.015625 68.078125 -26.015625 Z"/></g>
                    <g transform="translate(337.7992, 838.745308)"><path d="M 57.375 0.765625 C 31.019531 0.765625 17.84375 -12.492188 17.84375 -39.015625 L 17.84375 -93.84375 C 17.84375 -120.1875 31.019531 -133.359375 57.375 -133.359375 L 131.328125 -133.359375 C 157.671875 -133.359375 170.84375 -120.1875 170.84375 -93.84375 L 170.84375 -85.421875 C 170.84375 -82.191406 169.144531 -80.578125 165.75 -80.578125 L 135.15625 -80.578125 C 131.75 -80.578125 130.046875 -82.191406 130.046875 -85.421875 L 130.046875 -88.734375 C 130.046875 -94.003906 129.023438 -97.703125 126.984375 -99.828125 C 124.953125 -101.953125 121.300781 -103.015625 116.03125 -103.015625 L 72.171875 -103.015625 C 66.554688 -103.015625 62.644531 -101.867188 60.4375 -99.578125 C 58.226562 -97.285156 57.125 -93.414062 57.125 -87.96875 L 57.125 -44.875 C 57.125 -39.269531 58.226562 -35.316406 60.4375 -33.015625 C 62.644531 -30.722656 66.554688 -29.578125 72.171875 -29.578125 L 116.03125 -29.578125 C 121.300781 -29.578125 124.953125 -30.640625 126.984375 -32.765625 C 129.023438 -34.890625 130.046875 -38.585938 130.046875 -43.859375 L 130.046875 -47.4375 C 130.046875 -50.832031 131.75 -52.53125 135.15625 -52.53125 L 165.75 -52.53125 C 169.144531 -52.53125 170.84375 -50.832031 170.84375 -47.4375 L 170.84375 -39.015625 C 170.84375 -12.492188 157.671875 0.765625 131.328125 0.765625 Z"/></g>
                    <g transform="translate(566.533865, 838.745308)"><path d="M 57.375 0.765625 C 31.019531 0.765625 17.84375 -12.492188 17.84375 -39.015625 L 17.84375 -93.84375 C 17.84375 -120.1875 31.019531 -133.359375 57.375 -133.359375 L 131.328125 -133.359375 C 157.671875 -133.359375 170.84375 -120.1875 170.84375 -93.84375 L 170.84375 -85.421875 C 170.84375 -82.191406 169.144531 -80.578125 165.75 -80.578125 L 135.15625 -80.578125 C 131.75 -80.578125 130.046875 -82.191406 130.046875 -85.421875 L 130.046875 -88.734375 C 130.046875 -94.003906 129.023438 -97.703125 126.984375 -99.828125 C 124.953125 -101.953125 121.300781 -103.015625 116.03125 -103.015625 L 72.171875 -103.015625 C 66.554688 -103.015625 62.644531 -101.867188 60.4375 -99.578125 C 58.226562 -97.285156 57.125 -93.414062 57.125 -87.96875 L 57.125 -44.875 C 57.125 -39.269531 58.226562 -35.316406 60.4375 -33.015625 C 62.644531 -30.722656 66.554688 -29.578125 72.171875 -29.578125 L 116.03125 -29.578125 C 121.300781 -29.578125 124.953125 -30.640625 126.984375 -32.765625 C 129.023438 -34.890625 130.046875 -38.585938 130.046875 -43.859375 L 130.046875 -47.4375 C 130.046875 -50.832031 131.75 -52.53125 135.15625 -52.53125 L 165.75 -52.53125 C 169.144531 -52.53125 170.84375 -50.832031 170.84375 -47.4375 L 170.84375 -39.015625 C 170.84375 -12.492188 157.671875 0.765625 131.328125 0.765625 Z"/></g>
                    <g transform="translate(795.268508, 838.745308)"><path d="M 57.375 0.765625 C 31.019531 0.765625 17.84375 -12.492188 17.84375 -39.015625 L 17.84375 -93.84375 C 17.84375 -120.1875 31.019531 -133.359375 57.375 -133.359375 L 136.9375 -133.359375 C 150.195312 -133.359375 160.054688 -130.085938 166.515625 -123.546875 C 172.972656 -117.003906 176.203125 -107.101562 176.203125 -93.84375 L 176.203125 -39.015625 C 176.203125 -12.492188 163.113281 0.765625 136.9375 0.765625 Z M 122.140625 -30.09375 C 127.585938 -30.09375 131.457031 -31.238281 133.75 -33.53125 C 136.039062 -35.820312 137.1875 -39.691406 137.1875 -45.140625 L 137.1875 -87.71875 C 137.1875 -93.15625 136.039062 -97.019531 133.75 -99.3125 C 131.457031 -101.613281 127.585938 -102.765625 122.140625 -102.765625 L 72.171875 -102.765625 C 66.554688 -102.765625 62.644531 -101.613281 60.4375 -99.3125 C 58.226562 -97.019531 57.125 -93.15625 57.125 -87.71875 L 57.125 -45.140625 C 57.125 -39.691406 58.226562 -35.820312 60.4375 -33.53125 C 62.644531 -31.238281 66.554688 -30.09375 72.171875 -30.09375 Z"/></g>
                    <g transform="translate(1030.88815, 838.745308)"><path d="M 25.25 0 C 21.84375 0 20.140625 -1.695312 20.140625 -5.09375 L 20.140625 -127.5 C 20.140625 -130.894531 21.84375 -132.59375 25.25 -132.59375 L 54.3125 -132.59375 C 57.539062 -132.59375 59.15625 -130.894531 59.15625 -127.5 L 59.15625 -114.75 L 61.203125 -114.75 C 63.410156 -120.53125 67.359375 -125.078125 73.046875 -128.390625 C 78.742188 -131.703125 85.585938 -133.359375 93.578125 -133.359375 L 128.78125 -133.359375 C 132.175781 -133.359375 133.875 -131.660156 133.875 -128.265625 L 133.875 -102.765625 C 133.875 -99.367188 132.175781 -97.671875 128.78125 -97.671875 L 74.453125 -97.671875 C 69.015625 -97.671875 65.101562 -96.519531 62.71875 -94.21875 C 60.34375 -91.925781 59.15625 -88.0625 59.15625 -82.625 L 59.15625 -5.09375 C 59.15625 -1.695312 57.539062 0 54.3125 0 Z"/></g>
                    <g transform="translate(1211.172954, 838.745308)"><path d="M 57.375 0.765625 C 31.019531 0.765625 17.84375 -12.492188 17.84375 -39.015625 L 17.84375 -93.328125 C 17.84375 -119.503906 31.019531 -132.59375 57.375 -132.59375 L 132.34375 -132.59375 L 132.34375 -173.40625 C 132.34375 -176.800781 134.039062 -178.5 137.4375 -178.5 L 166.515625 -178.5 C 169.910156 -178.5 171.609375 -176.800781 171.609375 -173.40625 L 171.609375 -5.09375 C 171.609375 -1.695312 169.910156 0 166.515625 0 L 137.4375 0 C 134.039062 0 132.34375 -1.695312 132.34375 -5.09375 L 132.34375 -18.109375 L 130.3125 -18.109375 C 128.4375 -12.328125 124.609375 -7.734375 118.828125 -4.328125 C 113.046875 -0.929688 106.078125 0.765625 97.921875 0.765625 Z M 117.296875 -29.328125 C 122.734375 -29.328125 126.597656 -30.472656 128.890625 -32.765625 C 131.191406 -35.054688 132.34375 -38.925781 132.34375 -44.375 L 132.34375 -102.765625 L 72.171875 -102.765625 C 66.554688 -102.765625 62.644531 -101.613281 60.4375 -99.3125 C 58.226562 -97.019531 57.125 -93.15625 57.125 -87.71875 L 57.125 -44.375 C 57.125 -38.925781 58.226562 -35.054688 60.4375 -32.765625 C 62.644531 -30.472656 66.554688 -29.328125 72.171875 -29.328125 Z"/></g>
                  </g>
                  <!-- The Shield Icon (Orange) -->
                  <path fill="#ff751f" d="M 202.777344 648.179688 C 153.5 649.421875 104.8125 662.582031 61.140625 685.316406 C 65.964844 735.246094 81.308594 783.992188 107.34375 826.859375 C 111.957031 834.53125 116.910156 842 122.164062 849.242188 C 112.304688 833.476562 104.296875 816.554688 98.472656 798.855469 C 98.472656 798.855469 112.304688 833.476562 122.164062 849.242188 C 112.304688 833.476562 104.296875 816.554688 98.472656 798.855469 C 88.125 767.679688 83.808594 734.402344 85.480469 701.613281 C 120.304688 680.8125 160.097656 667.964844 200.445312 663.535156 C 249.183594 658.179688 299.613281 665.082031 344.675781 684.445312 C 300.890625 661.898438 252.058594 649.125 202.777344 648.179688 Z M 344.675781 684.445312 C 323.421875 677.5625 301.691406 672.535156 279.691406 669.621094 C 213.542969 660.664062 145.507812 672.542969 85.480469 701.613281 C 122.164062 684.378906 162.355469 674.738281 202.863281 673.523438 C 243.371094 674.46875 283.621094 683.847656 320.40625 700.855469 C 328.066406 752.28125 319.316406 806.214844 295.683594 852.542969 C 286.121094 871.695312 273.828125 889.707031 259.644531 905.71875 C 243.472656 924.007812 224.632812 939.992188 203.835938 952.726562 C 204.535156 952.335938 210.289062 949.152344 212.949219 947.628906 L 217.214844 945.128906 C 228.214844 938.523438 238.777344 931.164062 248.753906 923.085938 C 320.144531 865.890625 353.101562 774.480469 344.675781 684.445312 Z M 308.054688 798.179688 C 291.800781 848.648438 257.878906 892.945312 213.644531 922.160156 C 210.476562 924.277344 207.027344 926.46875 203.699219 928.476562 C 162.496094 904.730469 127.707031 870.082031 103.046875 829.472656 C 76.796875 786.308594 61.765625 735.820312 61.140625 685.316406 C 53.199219 775.375 86.859375 866.679688 158.59375 923.375 C 168.613281 931.390625 179.207031 938.683594 190.257812 945.214844 L 194.539062 947.6875 C 197.40625 949.292969 203.757812 952.765625 203.757812 952.765625 C 203.765625 952.765625 203.765625 952.757812 203.773438 952.757812 C 213.550781 945.5 222.925781 937.777344 231.765625 929.515625 C 251.617188 910.964844 268.828125 889.582031 282.640625 866.195312 C 311.855469 816.644531 324.265625 758.082031 320.402344 700.851562 C 322.296875 733.625 318.199219 766.9375 308.054688 798.179688 Z" />
                </svg>
              </div>
              <span style="font-size: ${titleSize}; font-weight: ${titleWeight}; color: ${titleColor}; font-family: ${titleFont}; letter-spacing: -0.01em;">${titleText}</span>
            </div>
          `;
          
          h2.appendChild(document.createElement("span")); // Tiny spacer
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isOpen]);

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
          mode: "redirect",
          redirectUrl: window.location.origin + "/",
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
            <h2 className="text-[28px] font-bold leading-tight tracking-tight text-[var(--accord-text)]">Sign into Accord</h2>
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
                      <p className="mt-2 text-base font-semibold text-[var(--accord-text)]">{currentConfig.label.replace(' Wallet', '')}</p>
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
                        wallets={wallets}
                        recommendedWallets={[createWallet("io.metamask")]}
                        showAllWallets={false}
                        hiddenWallets={["inApp", "embedded"]}
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

                <div className="surface-card space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                      <ShieldCheck className="h-5 w-5 text-[var(--accord-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-semibold text-[var(--accord-text)]">Create a wallet</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--accord-muted)]">
                        No extension needed. Sign in with Google or email to get started.
                      </p>
                    </div>
                  </div>

                  <div className="surface-muted space-y-3 px-4 py-4">
                    {[
                      { icon: Sparkles, text: "Real EVM wallet — works on Injective and other chains" },
                      { icon: Fingerprint, text: "Non-custodial — Accord never holds your keys" },
                      { icon: Download, text: "Exportable — move to MetaMask or Keplr anytime" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.text} className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-[var(--accord-primary)]" />
                          <p className="text-sm text-[var(--accord-muted)]">{item.text}</p>
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
                      Use My Own Wallet
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



