import React, { useState } from 'react';
import { Download, Send, Search, Mail } from 'lucide-react';

export default function ReceivedLinks() {
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Links', value: 0 },
    { label: 'Pending', value: 0 },
    { label: 'Sent', value: 0 },
    { label: 'Expired', value: 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Received Links</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage agreement links sent to you and track their status</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all">
            <Send className="w-3.5 h-3.5" /> Send Link
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-zinc-200 dark:border-white/5 p-4 text-center">
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by wallet address"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
          />
        </div>
        <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all">
          Search
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
          <Mail className="w-7 h-7 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">No links received yet</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Agreement links shared with you will appear here</p>
        </div>
      </div>
    </div>
  );
}
