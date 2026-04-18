import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownUp,
  Bell,
  ChevronDown,
  DollarSign,
  FileText,
  LayoutDashboard,
  Link2,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { resolveIpfsUrl } from "../lib/ipfs";
import AccordLogo from "./AccordLogo";

function shortenAddress(address) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const NAV_ITEMS = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard/overview",
  },
  {
    label: "My Agreements",
    icon: FileText,
    path: "/dashboard/agreements",
  },
  {
    label: "Agreements",
    icon: FileText,
    expandable: true,
    children: [
      { label: "Create Agreement", icon: Plus, path: "/dashboard/agreements/create" },
      { label: "My Agreements", icon: FileText, path: "/dashboard/agreements/deals" },
      { label: "Received Links", icon: Link2, path: "/dashboard/agreements/received" },
    ],
  },
  {
    label: "Vault",
    icon: Wallet,
    expandable: true,
    children: [
      { label: "Vault Balance", icon: DollarSign, path: "/dashboard/vault" },
      { label: "Withdraw", icon: ArrowDownUp, path: "/dashboard/vault/withdraw" },
      { label: "Connected Wallet", icon: Wallet, path: "/dashboard/vault/wallet" },
    ],
  },
  { label: "Notifications", icon: Bell, path: "/dashboard/notifications" },
  { label: "Disputes", icon: AlertTriangle, path: "/dashboard/disputes" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const sidebarMotion = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

export default function DashboardLayout({ children }) {
  const { address, logout, userProfile } = useWallet();
  const { isDark, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({ Agreements: true, Vault: false });

  const profileName = userProfile?.display_name?.trim();
  const displayName = profileName || (address ? shortenAddress(address) : "Wallet User");
  const avatarUrl = resolveIpfsUrl(userProfile?.avatar_url || "");
  const avatarFallback = profileName
    ? profileName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("")
    : address
      ? address.slice(2, 4).toUpperCase()
      : "AC";

  const isActive = (path) => location.pathname === path;
  const isParentActive = (childrenItems) =>
    childrenItems?.some((child) => location.pathname.startsWith(child.path));

  const closeSidebar = () => setSidebarOpen(false);
  const toggleExpand = (label) => setExpanded((current) => ({ ...current, [label]: !current[label] }));

  const navItemClass = (active) =>
    `group flex w-full items-center gap-3 rounded-r-lg border-l-2 px-4 py-3 text-sm font-semibold transition-all ${
      active
        ? "border-l-[var(--accord-primary)] bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"
        : "border-l-transparent text-[var(--accord-muted)] hover:bg-[var(--accord-primary-faint)] hover:text-[var(--accord-text)]"
    }`;

  const renderNav = () =>
    NAV_ITEMS.map((item) => {
      const Icon = item.icon;

      if (item.expandable) {
        const open = expanded[item.label];
        const active = isParentActive(item.children);

        return (
          <div key={item.label} className="space-y-1">
            <button type="button" onClick={() => toggleExpand(item.label)} className={navItemClass(active)}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 border-l border-[var(--accord-border)] pl-4">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={closeSidebar}
                          className={navItemClass(isActive(child.path))}
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      }

      return (
        <Link key={item.path} to={item.path} onClick={closeSidebar} className={navItemClass(isActive(item.path))}>
          <Icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
          {item.label === "Notifications" ? <span className="ml-auto h-2 w-2 rounded-full bg-[var(--accord-primary)]" /> : null}
        </Link>
      );
    });

  const sidebar = (
    <div className="flex h-full flex-col bg-[var(--accord-background)]">
      <div className="flex h-16 items-center justify-between border-b border-[var(--accord-border)] px-5">
        <Link to="/dashboard/overview" onClick={closeSidebar} className="flex items-center gap-3">
          <div className="h-8 w-8">
            <AccordLogo variant={isDark ? "dark" : "light"} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">Escrow</p>
            <p className="text-lg font-bold tracking-tight text-[var(--accord-primary)]">Accord</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={closeSidebar}
          className="icon-button h-10 w-10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-5">
        <button
          type="button"
          onClick={() => {
            navigate("/dashboard/agreements/create");
            closeSidebar();
          }}
          className="primary-button w-full"
        >
          <Plus className="h-4 w-4" />
          New Agreement
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">{renderNav()}</nav>

      <div className="border-t border-[var(--accord-border)] px-5 py-5">
        <div className="surface-muted flex items-center gap-3 px-3 py-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-[var(--accord-border)] bg-[var(--accord-surface-strong)] text-sm font-semibold text-[var(--accord-text)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--accord-text)]">{displayName}</p>
            {address ? <p className="truncate text-xs text-[var(--accord-muted)]">{shortenAddress(address)}</p> : null}
          </div>
          <button type="button" onClick={logout} className="destructive-button px-3 py-2 text-xs">
            Exit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell flex min-h-screen bg-[var(--accord-background)] text-[var(--accord-text)]">
      <AnimatePresence>
        {sidebarOpen ? (
          <Motion.button
            type="button"
            aria-label="Close sidebar backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-[var(--accord-backdrop)] backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside className="hidden w-[220px] shrink-0 border-r border-[var(--accord-border)] lg:block">{sidebar}</aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <Motion.aside
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarMotion}
            transition={{ duration: 0.18 }}
            className="fixed inset-y-0 left-0 z-50 w-[220px] border-r border-[var(--accord-border)] bg-[var(--accord-background)] lg:hidden"
          >
            {sidebar}
          </Motion.aside>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
          <div className="page-shell flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="icon-button h-10 w-10 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="eyebrow">Dashboard</p>
                <p className="truncate text-sm text-[var(--accord-text)]">
                  Hello, <Link to="/dashboard/settings" className="font-semibold text-[var(--accord-primary)]">{displayName}</Link>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme} className="icon-button h-10 w-10" aria-label="Toggle theme">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link to="/dashboard/notifications" className="icon-button relative h-10 w-10">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--accord-primary)]" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}



