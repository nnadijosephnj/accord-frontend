import React, { useState } from 'react';
import { AlertTriangle, Download, Search, ChevronDown } from 'lucide-react';

export default function Disputes() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Disputes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage and resolve agreement disputes</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all self-start sm:self-auto">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agreement ID or wallet address"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-400 cursor-pointer"
          >
            {['All', 'Open', 'Under Review', 'Resolved', 'Closed'].map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm py-24 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-zinc-900 dark:text-white">No disputes found</p>
          <p className="text-sm text-orange-500 dark:text-orange-400 mt-1 font-medium">All your agreements are running smoothly!</p>
        </div>
      </div>
    </div>
  );
}
