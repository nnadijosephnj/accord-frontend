import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion as Motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Lock,
  LockKeyhole,
  Moon,
  Shield,
  Sun,
  UserCheck,
  Wallet,
  Globe,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccordLogo from "../components/AccordLogo";
import AccordHero from "../components/AccordHero";
import Hero1SectionBackground from "../assets/hero1sectionbackground.png";
import PictureElementsToLayer from "../assets/pictureelementstobelayerdontopofherobackground.png";
import HeroElementsSVG from "../components/HeroElementsSVG";
import P2PSection from "../components/P2PSection";
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
  const [langOpen, setLangOpen] = useState(false);

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
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-40 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
        <div className="page-shell flex h-14 sm:h-18 items-center justify-between px-3 sm:px-8">
          {/* LEFT SIDE: Brand Identity */}
          <div className="flex shrink-0 items-center">
            <div className="h-6 w-24 sm:h-8 sm:w-36">
              <AccordLogo variant={isDark ? "dark" : "light"} />
            </div>
          </div>

          {/* RIGHT SIDE: Compact Action Dock */}
          <div className="flex items-center gap-0 sm:gap-4">
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setLangOpen(!langOpen)}
                className={`icon-button flex h-9 w-auto px-1.5 sm:h-11 sm:px-3 items-center justify-center transition-all duration-200 ${langOpen ? 'bg-[var(--accord-primary-soft)] border-[var(--accord-primary)]' : 'border-transparent'}`} 
                aria-label="Language selection"
              >
                <Globe className={`h-[15px] w-[15px] sm:h-5 sm:w-5 ${langOpen ? 'text-[var(--accord-primary)]' : ''}`} />
                <span className={`ml-1 text-[10px] sm:text-[12px] font-bold uppercase tracking-tight ${langOpen ? 'text-[var(--accord-primary)]' : 'text-[var(--accord-text)]'}`}>EN</span>
                <ChevronDown className={`ml-0.5 h-2 w-2 transition-transform duration-200 ${langOpen ? 'rotate-180 text-[var(--accord-primary)]' : 'text-[var(--accord-muted)]'}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <Motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 z-50 min-w-[160px] overflow-hidden rounded-xl border border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-2xl shadow-2xl"
                    >
                      {[
                        { code: 'EN', name: 'English' },
                        { code: 'ES', name: 'Español' },
                        { code: 'FR', name: 'Français' },
                        { code: 'DE', name: 'Deutsch' },
                        { code: 'ID', name: 'Bahasa' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setLangOpen(false)}
                          className="flex h-11 w-full items-center justify-between px-4 text-left transition-colors hover:bg-[var(--accord-primary-faint)] group"
                        >
                          <span className="text-sm font-semibold text-[var(--accord-text)] group-hover:text-[var(--accord-primary)]">
                            {lang.name}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--accord-muted)] opacity-50">
                            {lang.code}
                          </span>
                        </button>
                      ))}
                    </Motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button type="button" onClick={toggle} className="icon-button flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center border-transparent" aria-label="Toggle light/dark mode">
              {isDark ? <Sun className="h-[16px] w-[16px] sm:h-5 sm:w-5" /> : <Moon className="h-[16px] w-[16px] sm:h-5 sm:w-5" />}
            </button>
            <button type="button" className="icon-button h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center border-transparent" aria-label="Navigation menu">
              <Menu className="h-[16px] w-[16px] sm:h-5 sm:w-5" />
            </button>

            <button type="button" onClick={handleLoginStart} className="primary-button ml-1 h-9 px-3 text-[10px] sm:ml-2 sm:h-11 sm:px-8 sm:text-[13px] shrink-0 font-bold uppercase tracking-[0.08em] rounded-lg">
              {isConnecting ? "..." : "Launch App"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Section 1: Fully Native Layered Background Stack ── */}
      <section className="landing-video-section">
        <div className="landing-video-wrapper">
          {/* Layer 1: Background Base */}
          <Motion.img
            src={Hero1SectionBackground}
            alt="Hero Background"
            className="landing-video-iframe"
            style={{ objectFit: 'cover' }}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Layer 2: Middle Transparent Elements */}
          <Motion.img
            src={PictureElementsToLayer}
            alt="Middle Graphic Layer"
            className="landing-video-overlay"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          />

          {/* Layer 3: Top SVG Elements (Raw DOM injection for CSS animation) */}
          <Motion.div 
            className="landing-video-overlay" 
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
          >
            <HeroElementsSVG />
          </Motion.div>
        </div>
      </section>

      {/* ── Section 2: P2P Trustless Escrow (New) ── */}
      <P2PSection />

      {/* ── Section 3: Original hero content ── */}
      <section className="landing-hero-section">
        <div className="landing-hero-inner">
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

      <main className="page-shell px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

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


