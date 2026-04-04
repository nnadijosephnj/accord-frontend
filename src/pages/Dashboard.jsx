import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Moon, Sun, LayoutDashboard, FileText, Wallet, Bell, Settings, LogOut, Clock, CheckCircle2, Shield, Search, ChevronDown, ArrowRight, Menu } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import * as ethers from 'ethers';
import { apiCall } from '../utils/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDC_ADDRESS } from '../utils/contractABI';

function RoleModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full sm:max-w-lg bg-white/70 dark:bg-[#1a1919]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Select Role</h2>
            <button onClick={onClose} className="p-2 text-zinc-400 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-zinc-500 dark:text-neutral-400 font-medium text-sm mb-8">Choose how you want to create the agreement</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Freelancer */}
            <div
              onClick={() => navigate('/create/freelancer')}
              className="group cursor-pointer bg-white/50 dark:bg-black/40 border-2 border-transparent hover:border-orange-500/50 p-6 rounded-[1.5rem] transition-all"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                👨‍💻
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1">Freelancer</h3>
              <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium leading-relaxed">
                I will do the work and receive payment
              </p>
            </div>

            {/* Client */}
            <div
              onClick={() => navigate('/create/client')}
              className="group cursor-pointer bg-white/50 dark:bg-black/40 border-2 border-transparent hover:border-orange-500/50 p-6 rounded-[1.5rem] transition-all"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                💼
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1">Client</h3>
              <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium leading-relaxed">
                I will deposit funds to pay for work
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { userProfile, address } = useWallet();
  const { isDark, toggle } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${address}`;
  const userName = userProfile?.display_name || "User";

  const [vaultBalances, setVaultBalances] = useState({ usdt: '0.00', usdc: '0.00' });
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { signer } = useWallet();

  useEffect(() => {
    if (address) {
      loadStats();
      loadAgreements();
    }
  }, [address]);

  const loadStats = async () => {
    try {
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const usdtVal = await contract.getVaultBalance(address, USDT_ADDRESS);
      const usdcVal = await contract.getVaultBalance(address, USDC_ADDRESS);
      
      if (usdtVal !== undefined && usdtVal !== null) {
        setVaultBalances(prev => ({
          ...prev,
          usdt: ethers.formatUnits(usdtVal, 6)
        }));
      }
      if (usdcVal !== undefined && usdcVal !== null) {
        setVaultBalances(prev => ({
          ...prev,
          usdc: ethers.formatUnits(usdcVal, 6)
        }));
      }
    } catch (e) {
      console.warn("Vault load error:", e);
    }
  };

  const loadAgreements = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/agreements');
      setAgreements(data || []);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
    { label: "My Transactions", icon: <FileText className="w-5 h-5" />, path: "#" },
    { label: "Wallets", icon: <Wallet className="w-5 h-5" />, path: "#" },
    { label: "Notifications", icon: <Bell className="w-5 h-5" />, path: "#" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/profile" },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f6f7] dark:bg-[#0a0a0a] font-sans selection:bg-orange-500/30 text-zinc-900 dark:text-white overflow-x-hidden max-w-[100vw]">
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`fixed lg:sticky top-0 h-screen w-72 flex-col bg-white/95 dark:bg-[#111111]/95 lg:bg-white/70 lg:dark:bg-[#111111]/80 backdrop-blur-2xl border-r border-zinc-200/50 dark:border-white/5 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex`}>
        <div className="p-6 h-20 flex items-center justify-between border-b border-zinc-100 dark:border-white/5">
          <Link to="/" className="flex items-center">
            <img src="/logo-light.png" alt="Accord" className="h-10 dark:hidden" />
            <img src="/logo-dark.png" alt="Accord" className="h-10 hidden dark:block" />
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-[#ff9157] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(234,88,12,0.3)] hover:shadow-[0_10px_40px_rgba(234,88,12,0.5)] hover:-translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            NEW AGREEMENT
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={i}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  isActive 
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-[#ff9157] shadow-sm"
                    : "text-zinc-500 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{userName}</p>
              <p className="text-xs text-zinc-500 font-medium truncate">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Not connected'}</p>
            </div>
            <button className="ml-auto p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative w-full lg:max-w-[calc(100vw-18rem)] min-w-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 dark:bg-[#ff9157]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

        {/* TOP HEADER */}
        <header className="h-20 px-4 sm:px-10 flex items-center justify-between sticky top-0 bg-[#f5f6f7]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/5 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white hover:text-orange-500 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Hi, <span className="uppercase text-orange-600 dark:text-[#ff9157]">{userName}</span>
            </h1>
            <span className="text-zinc-500 dark:text-neutral-400 font-medium hidden sm:inline-block">
              , here's what's happening today
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency selector dummy */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-sm font-bold">
              USDT <ChevronDown className="w-4 h-4 text-zinc-400" />
            </div>
            <button
              onClick={toggle}
              className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-[#ff9157] transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-[#ff9157] transition-all shadow-sm relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-900" />
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 p-6 sm:p-10 overflow-x-hidden">
          
          {/* 4 STAT CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {/* AMOUNT IN ESCROW (Primary Colored Card) */}
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 text-white overflow-hidden shadow-[0_15px_30px_rgba(234,88,12,0.2)] dark:shadow-[0_15px_30px_rgba(255,145,87,0.15)] group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-orange-100">Agreements List</p>
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-1 relative z-10 font-mono tracking-tight">{agreements.length}</h2>
              <p className="text-sm font-medium text-orange-200 relative z-10">Total active / history</p>
            </div>

            {/* USDT VAULT BALANCE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-neutral-500">USDT Vault</p>
                <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl">
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-1 font-mono text-zinc-900 dark:text-white">{Number(vaultBalances.usdt).toFixed(2)}</h2>
              <p className="text-sm font-medium text-zinc-500 italic">Available in Injective</p>
            </div>

            {/* AWAITING APPROVAL */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-neutral-500">Awaiting Approval</p>
                <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-1 font-mono text-zinc-900 dark:text-white">0</h2>
              <p className="text-sm font-medium text-zinc-500">Requires review</p>
            </div>

            {/* USDC VAULT BALANCE */}
            <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#111111]/50 border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-neutral-500">USDC Vault</p>
                <div className="p-2 bg-white dark:bg-black/50 rounded-xl shadow-sm">
                  <Wallet className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-1 font-mono text-zinc-900 dark:text-white">{Number(vaultBalances.usdc).toFixed(2)}</h2>
              <p className="text-sm font-medium text-zinc-500 italic">Available in Injective</p>
            </div>
          </div>

          {/* TRANSACTIONS SECTION */}
          <div className="bg-white/70 dark:bg-[#111111] rounded-[2rem] border border-zinc-200/50 dark:border-white/5 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/5">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Transactions</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-neutral-400">Manage your escrow agreements and history</p>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-[#ff9157] hover:underline px-4 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                See all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-black/20 text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-white/5">
                    <th className="px-8 py-5">Transaction Type</th>
                    <th className="px-8 py-5">Number</th>
                    <th className="px-8 py-5">Involved Parties</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Initiated On</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.length > 0 ? (
                    agreements.map((item, i) => (
                      <tr 
                        key={i} 
                        onClick={() => { if (item?.id) navigate(`/deal/${item.id}`); }}
                        className="group border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-lg">
                              🤝
                            </div>
                            <div>
                              <p className="text-sm font-black text-zinc-900 dark:text-white truncate max-w-[200px]">{item?.title || "Untitled Agreement"}</p>
                              <p className="text-[10px] text-zinc-400 dark:text-neutral-500 font-bold uppercase tracking-tight">Standard Escrow</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs font-bold text-zinc-400 group-hover:text-orange-500 transition-colors">
                          #{item?.id?.slice(0, 8) || "N/A"}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-zinc-700 dark:text-neutral-300">Client: {item?.client_wallet?.slice(0, 6)}...</span>
                            <span className="text-xs font-bold text-zinc-400 dark:text-neutral-500 italic">Dev: {item?.freelancer_wallet?.slice(0, 6)}...</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-zinc-900 dark:text-white">
                          ${item?.amount || item?.amount_usdt || "0"} <span className="text-[10px] text-orange-600 dark:text-orange-400 ml-1">{item?.token_address?.toLowerCase() === USDC_ADDRESS?.toLowerCase() ? 'USDC' : 'USDT'}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-neutral-300`}>
                             {item?.status || "PENDING"}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-zinc-400">
                          {item?.created_at ? new Date(item.created_at).toLocaleDateString() : '---'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 text-zinc-300 hover:text-orange-500 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-zinc-300 dark:text-white/10">
                            <FileText className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-black text-zinc-900 dark:text-white mb-1">No transactions found</h4>
                          <p className="text-sm font-medium text-zinc-500 dark:text-neutral-400 max-w-xs mx-auto">
                            Agreements will appear here once you create or receive an invite.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
