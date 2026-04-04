import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Download, ChevronDown, ArrowRight } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { apiCall } from '../../utils/api';

function StatusBadge({ status }) {
  const map = {
    FUNDED: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    DELIVERED: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
    COMPLETED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    DISPUTED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    CANCELLED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    PENDING: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  };
  const cls = map[status] || 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status || 'PENDING'}
    </span>
  );
}

export default function MyAgreements() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  useEffect(() => {
    if (address) loadAgreements();
  }, [address]);

  const loadAgreements = async () => {
    try {
      const data = await apiCall('/api/agreements');
      setAgreements(data || []);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = agreements.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.id?.toLowerCase().includes(q) ||
      a.amount?.toString().includes(q) ||
      a.client_wallet?.toLowerCase().includes(q) ||
      a.freelancer_wallet?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchType =
      typeFilter === 'All' ||
      (typeFilter === 'As Freelancer' && a.freelancer_wallet?.toLowerCase() === address?.toLowerCase()) ||
      (typeFilter === 'As Client' && a.client_wallet?.toLowerCase() === address?.toLowerCase());
    return matchSearch && matchStatus && matchType;
  });

  const SelectDropdown = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-400 cursor-pointer"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">My Agreements</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your escrow agreements and payment history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, amount, or wallet address"
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
            />
          </div>
          <SelectDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All', 'Funded', 'Delivered', 'Completed', 'Disputed', 'Cancelled']}
          />
          <SelectDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={['All', 'As Freelancer', 'As Client']}
          />
          <SelectDropdown
            value={dateFilter}
            onChange={setDateFilter}
            options={['All Time', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year']}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-black/20 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-white/5">
                <th className="px-5 py-3">Agreement Type</th>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Parties</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-zinc-400">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => item?.id && navigate(`/deal/${item.id}`)}
                    className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-sm">
                          🤝
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[160px]">
                            {item?.title || 'Untitled'}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">
                            Standard Escrow
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                      #{item?.id?.slice(0, 8) || 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        <p className="font-medium">Client: {item?.client_wallet ? `${item.client_wallet.slice(0,6)}...${item.client_wallet.slice(-4)}` : '—'}</p>
                        <p className="text-zinc-400">Dev: {item?.freelancer_wallet ? `${item.freelancer_wallet.slice(0,6)}...${item.freelancer_wallet.slice(-4)}` : '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-zinc-900 dark:text-white">
                      ${parseFloat(item?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item?.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {item?.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-zinc-300 hover:text-orange-500 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">No agreements found</p>
                        <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                          Agreements are created when you send or receive agreement links
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
