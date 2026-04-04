import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Wallet, Bell, Settings,
  AlertTriangle, ChevronDown, Plus, X, Menu,
  Link2, DollarSign, ArrowDownUp, Sun, Moon
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const NAV_ITEMS = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/dashboard/overview',
  },
  {
    label: 'My Agreements',
    icon: FileText,
    path: '/dashboard/agreements',
  },
  {
    label: 'Agreements',
    icon: FileText,
    expandable: true,
    children: [
      { label: 'Create Agreement', icon: Plus, path: '/dashboard/agreements/create' },
      { label: 'My Agreements', icon: FileText, path: '/dashboard/agreements/deals' },
      { label: 'Received Links', icon: Link2, path: '/dashboard/agreements/received' },
    ],
  },
  {
    label: 'Vault',
    icon: Wallet,
    expandable: true,
    children: [
      { label: 'Vault Balance', icon: DollarSign, path: '/dashboard/vault' },
      { label: 'Withdraw', icon: ArrowDownUp, path: '/dashboard/vault/withdraw' },
      { label: 'Connected Wallet', icon: Wallet, path: '/dashboard/vault/wallet' },
    ],
  },
  { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { label: 'Disputes', icon: AlertTriangle, path: '/dashboard/disputes' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout({ children }) {
  const { address, logout, userProfile } = useWallet();
  const { isDark, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({ Agreements: true, Vault: false });

  const toggleExpand = (label) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path) => location.pathname === path;
  const isParentActive = (kids) =>
    kids?.some((c) => location.pathname.startsWith(c.path));

  const closeSidebar = () => setSidebarOpen(false);

  const renderNav = () =>
    NAV_ITEMS.map((item) => {
      const Icon = item.icon;

      if (item.expandable) {
        const isOpen = expanded[item.label];
        const parentActive = isParentActive(item.children);
        return (
          <div key={item.label}>
            <button
              onClick={() => toggleExpand(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                parentActive
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-8 py-1 space-y-0.5">
                    {item.children.map((child) => {
                      const CIcon = child.icon;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={closeSidebar}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive(child.path)
                              ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-white'
                          }`}
                        >
                          <CIcon className="w-3.5 h-3.5 shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={closeSidebar}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isActive(item.path)
              ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {item.label}
          {item.label === 'Notifications' && (
            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Link>
      );
    });

  const sidebarBody = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 shrink-0">
        <Link to="/dashboard/overview" className="flex items-center">
          <img src="/logo-light.png" alt="Accord" className="h-8 dark:hidden" />
          <img src="/logo-dark.png" alt="Accord" className="h-8 hidden dark:block" />
        </Link>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Agreement Button */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <button
          onClick={() => { navigate('/dashboard/agreements/create'); closeSidebar(); }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(234,88,12,0.35)] hover:shadow-[0_8px_28px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Agreement
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {renderNav()}
      </nav>

      {/* Bottom: Wallet Info */}
      <div className="px-4 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-xs">
                {address ? address.slice(2, 4).toUpperCase() : 'AC'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-800 dark:text-white truncate">
              {userProfile?.display_name || 'User'}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">{shortenAddress(address)}</p>
          </div>
          <button
            onClick={logout}
            title="Disconnect"
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f5f6f7] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-sans">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#111111] border-r border-zinc-200 dark:border-white/5 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarBody}
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* TOP BAR */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:text-orange-600 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              Hi,{' '}
              <Link to="/dashboard/settings" className="group flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-zinc-900 dark:text-white uppercase transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate">
                  {userProfile?.display_name || 'User'}
                </span>
                <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
              </Link>
              <span className="hidden sm:inline">, here&apos;s what&apos;s happening today</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/dashboard/notifications"
              className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
