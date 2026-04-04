import React, { useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';

// Moved outside component to avoid creating components during render
function SelectDropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-400 cursor-pointer"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
    </div>
  );
}

export default function Notifications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Notifications</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">View all activity notifications for your account</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or content"
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
            />
          </div>
          <SelectDropdown value={statusFilter} onChange={setStatusFilter} options={['All', 'Sent', 'Failed']} />
          <SelectDropdown value={dateFilter} onChange={setDateFilter} options={['All Time', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year']} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-black/20 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-white/5">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">No notifications yet</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Activity notifications will appear here</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-xs text-zinc-400">0 notifications</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">← Prev</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
