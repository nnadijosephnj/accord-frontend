import React, { useState } from 'react';
import { DollarSign, ChevronDown, ArrowDownUp } from 'lucide-react';

export default function Withdraw() {
  const [statusFilter, setStatusFilter] = useState('All');

  const stats = [
    { label: 'Total Withdrawn', value: '$0.00', sub: 'All time withdrawals', primary: false },
    { label: 'Available to Withdraw', value: '$0.00', sub: 'Ready to withdraw', primary: true },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Withdraw</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">View and manage your withdrawals</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all self-start sm:self-auto">
          <ArrowDownUp className="w-3.5 h-3.5" /> Withdraw to Keplr
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative p-5 rounded-2xl overflow-hidden ${
              s.primary
                ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_10px_30px_rgba(234,88,12,0.25)]'
                : 'bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/5 shadow-sm'
            }`}
          >
            {s.primary && <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />}
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${s.primary ? 'text-orange-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
              {s.label}
            </p>
            <p className={`text-3xl font-black font-mono mb-1 ${s.primary ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
              {s.value}
            </p>
            <p className={`text-xs ${s.primary ? 'text-orange-200' : 'text-zinc-400 dark:text-zinc-500'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-white/5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Withdrawal History</h2>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              {['All', 'Completed', 'Failed'].map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Empty State */}
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No withdrawals found</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">You haven't made any withdrawals yet</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] transition-all">
            <ArrowDownUp className="w-3.5 h-3.5" /> Withdraw to Keplr
          </button>
        </div>
      </div>
    </div>
  );
}
