import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Shield, Clock, CheckCircle2, Wallet, FileText, ArrowRight
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { apiCall } from '../../utils/api';
import * as ethers from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDC_ADDRESS } from '../../utils/contractABI';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

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

export default function Overview() {
  const { address, signer } = useWallet();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [vaultBalance, setVaultBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const data = await apiCall('/api/agreements');
      setAgreements(data || []);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
    try {
      if (signer) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const bal = await contract.vaultBalances(address, USDC_ADDRESS);
        if (bal !== undefined) setVaultBalance(Number(ethers.formatUnits(bal, 6)).toFixed(2));
      }
    } catch (e) {
      console.warn('Vault load error:', e);
    }
  };

  const inEscrow = agreements
    .filter((a) => ['FUNDED', 'DELIVERED'].includes(a.status))
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0)
    .toFixed(2);

  const pending = agreements.filter((a) => a.status === 'PENDING').length;
  const awaitingApproval = agreements.filter((a) => a.status === 'DELIVERED').length;

  const stats = [
    {
      label: 'Amount in Escrow',
      value: `$${inEscrow}`,
      sub: 'Total held securely',
      icon: Shield,
      primary: true,
    },
    {
      label: 'Pending Agreements',
      value: pending,
      sub: 'Awaiting action',
      icon: Clock,
      primary: false,
    },
    {
      label: 'Awaiting Approval',
      value: awaitingApproval,
      sub: 'Requires review',
      icon: CheckCircle2,
      primary: false,
    },
    {
      label: 'Vault Balance',
      value: `$${vaultBalance}`,
      sub: 'Available',
      icon: Wallet,
      primary: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your escrow summary at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={`relative p-5 rounded-2xl overflow-hidden ${
                stat.primary
                  ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_10px_30px_rgba(234,88,12,0.25)]'
                  : 'bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/5 shadow-sm'
              }`}
            >
              {stat.primary && (
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              )}
              <div className="flex justify-between items-start mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.primary ? 'text-orange-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {stat.label}
                </p>
                <div className={`p-1.5 rounded-lg ${stat.primary ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/5'}`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.primary ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </div>
              <p className={`text-3xl font-black font-mono tracking-tight mb-1 ${stat.primary ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                {stat.value}
              </p>
              <p className={`text-xs font-medium ${stat.primary ? 'text-orange-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {stat.sub}
              </p>
            </Motion.div>
          );
        })}
      </div>

      {/* Agreements Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-white/5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Agreements</h2>
          <Link
            to="/dashboard/agreements"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

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
              ) : agreements.length > 0 ? (
                agreements.slice(0, 6).map((item, i) => (
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
                    <td className="px-5 py-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">
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
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">No recent agreements found</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Create your first agreement to get started</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Motion.div>
    </div>
  );
}
