import React, { useEffect, useRef } from "react";
import { animate, motion as Motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Lock,
  LockKeyhole,
  Moon,
  Shield,
  Sun,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccordLogo from "../components/AccordLogo";
import AccordHero from "../components/AccordHero";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";

function Counter({ from, to, duration = 1.8, formattingFn = (value) => value }) {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) {
      return;
    }

    const controls = animate(from, to, {
      duration,
      onUpdate(value) {
        if (nodeRef.current) {
          nodeRef.current.textContent = formattingFn(value);
        }
      },
    });

    return () => controls.stop();
  }, [duration, formattingFn, from, inView, to]);

  return <span ref={nodeRef}>{formattingFn(from)}</span>;
}

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Landing() {
  const { openAuthModal, isConnecting } = useWallet();
  const { isConnected } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/dashboard");
    }
  }, [isConnected, navigate]);

  const handleLoginStart = () => {
    openAuthModal("CHOICE");
  };

  const flowSteps = [
    {
      title: "Create the agreement",
      description: "Define the work, amount, and wallet counterpart in a structured escrow agreement.",
      icon: UserCheck,
    },
    {
      title: "Lock the payment",
      description: "The client funds the agreement and the contract holds value until the work is approved.",
      icon: LockKeyhole,
    },
    {
      title: "Release with confidence",
      description: "Approval settles funds onchain and the final handoff happens inside the same workflow.",
      icon: Lock,
    },
  ];

  const principles = [
    {
      title: "Escrow without the platform risk",
      description: "Funds sit inside contract logic instead of a marketplace operator.",
    },
    {
      title: "Designed for freelance work",
      description: "Link-based agreements make it simple to start with a client who has never used Accord before.",
    },
    {
      title: "Clear status at every stage",
      description: "Every agreement shows exactly where it is, what action is next, and how much value is involved.",
    },
  ];

  return (
    <div className="app-shell min-h-screen text-[var(--accord-text)]">
      <nav className="sticky top-0 z-40 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-36">
              <AccordLogo variant={isDark ? "dark" : "light"} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} className="icon-button h-10 w-10" aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={handleLoginStart} className="primary-button">
              {isConnecting ? "Opening Access" : "Sign In"}
            </button>
          </div>
        </div>
      </nav>

      <main className="page-shell px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <section className="border-b border-[var(--accord-border)] pb-12 mb-16">
          <div className="mx-auto w-full max-w-6xl">
            <AccordHero />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <button type="button" onClick={handleLoginStart} className="primary-button">
                {isConnecting ? "Opening Access" : "Launch Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#how-it-works" className="secondary-button">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="space-y-8 py-16">
          <Motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={reveal}>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-[28px] font-bold leading-tight text-[var(--accord-text)]">A simple escrow workflow for both sides of the deal</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--accord-muted)]">
              Accord keeps the steps explicit so clients know when to fund, freelancers know when to deliver, and both
              sides have the same shared state from start to finish.
            </p>
          </Motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={reveal}
                  transition={{ delay: index * 0.05 }}
                  className="surface-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                      <Icon className="h-5 w-5 text-[var(--accord-primary)]" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--accord-primary)]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-[18px] font-semibold text-[var(--accord-text)]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">{step.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-y border-[var(--accord-border)] py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <Motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={reveal} className="space-y-6">
            <div>
              <p className="eyebrow">Why Accord</p>
              <h2 className="mt-3 text-[28px] font-bold leading-tight text-[var(--accord-text)]">Made to feel like a serious financial product, not a speculative template.</h2>
            </div>

            <div className="space-y-4">
              {principles.map((item) => (
                <div key={item.title} className="surface-card">
                  <h3 className="text-[18px] font-semibold text-[var(--accord-text)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="space-y-4"
          >
            <div className="surface-card">
              <p className="eyebrow">Network foundation</p>
              <h3 className="mt-3 text-[18px] font-semibold text-[var(--accord-text)]">Built on Injective EVM</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                Accord uses Injective EVM for contract-based escrow while keeping the interface understandable to users
                who just need secure project payments.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="surface-muted px-4 py-4">
                  <p className="metric-label">Primary action</p>
                  <p className="metric-copy mt-3">Fund or release with clear status changes.</p>
                </div>
                <div className="surface-muted px-4 py-4">
                  <p className="metric-label">Shared room</p>
                  <p className="metric-copy mt-3">Agreement details and project notes live together.</p>
                </div>
              </div>
            </div>

            <div className="surface-card">
              <p className="eyebrow">Product direction</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accord-primary)]" />
                  <p className="text-sm leading-7 text-[var(--accord-muted)]">Minimalist dark surfaces with accent reserved for the most important actions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accord-primary)]" />
                  <p className="text-sm leading-7 text-[var(--accord-muted)]">Focused typography and spacing that support transaction-heavy screens.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accord-primary)]" />
                  <p className="text-sm leading-7 text-[var(--accord-muted)]">No decorative noise competing with escrow amounts, statuses, or next actions.</p>
                </div>
              </div>
            </div>
          </Motion.div>
        </section>

        <section className="py-16">
          <div className="surface-card flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">Get started</p>
              <h2 className="text-[28px] font-bold leading-tight text-[var(--accord-text)]">Create your first agreement and move a deal forward with less friction.</h2>
              <p className="max-w-2xl text-sm leading-7 text-[var(--accord-muted)]">
                Sign in with your wallet, create the agreement, and share the link with the other party when you are ready.
              </p>
            </div>
            <button type="button" onClick={handleLoginStart} className="primary-button self-start lg:self-auto">
              {isConnecting ? "Opening Access" : "Open Accord"}
              <Wallet className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--accord-border)]">
        <div className="page-shell flex flex-col gap-4 px-4 py-8 text-sm text-[var(--accord-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-32">
              <AccordLogo variant={isDark ? "dark" : "light"} />
            </div>
            <span className="text-sm">secures agreements for digital work onchain.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Built for Injective EVM</span>
            <span>2026 Accord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


