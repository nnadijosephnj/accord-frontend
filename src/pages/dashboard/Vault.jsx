import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Lock, TrendingUp, ArrowDownUp, Plus, Wallet } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import * as ethers from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDC_ADDRESS } from '../../utils/contractABI';

export default function VaultPage() {
  const { address, signer, network } = useWallet();
  const [vaultBalance, setVaultBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const networkLabel = network === 'mainnet' ? 'Injective EVM Mainnet' : 'Injective EVM Testnet';

  useEffect(() => {
    if (signer && address) loadBalance();
  }, [signer, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBalance = async () => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const bal = await contract.vaultBalances(address, USDC_ADDRESS);
      if (bal !== undefined) setVaultBalance(Number(ethers.formatUnits(bal, 6)).toFixed(2));
    } catch (e) {
      console.warn('Vault load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: 'Vault Balance',
      value: `$${vaultBalance}`,
      sub: 'Available to use',
      icon: DollarSign,
      primary: true,
    },
    {
      label: 'In Escrow',
      value: '$0.00',
      sub: 'Locked in active agreements',
      icon: Lock,
      primary: false,
    },
    {
      label: 'Total Deposited',
      value: '$0.00',
      sub: 'All time deposits',
      icon: TrendingUp,
      primary: false,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Vault</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your account balance and deposits</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/vault/withdraw" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
            <ArrowDownUp className="w-3.5 h-3.5" /> Withdraw
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all">
            <Plus className="w-3.5 h-3.5" /> Deposit USDC
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative p-5 rounded-2xl overflow-hidden ${
                card.primary
                  ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_10px_30px_rgba(234,88,12,0.25)]'
                  : 'bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/5 shadow-sm'
              }`}
            >
              {card.primary && <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />}
              <div className="flex justify-between items-start mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${card.primary ? 'text-orange-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {card.label}
                </p>
                <div className={`p-1.5 rounded-lg ${card.primary ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/5'}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.primary ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </div>
              <p className={`text-3xl font-black font-mono mb-1 ${card.primary ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                {loading && card.primary ? '...' : card.value}
              </p>
              <p className={`text-xs ${card.primary ? 'text-orange-200' : 'text-zinc-400 dark:text-zinc-500'}`}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-white/5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Activity</h2>
            <button className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline">View all</button>
          </div>
          <div className="px-5 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm p-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_4px_12px_rgba(234,88,12,0.25)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Deposit USDC
            </button>
            <Link to="/dashboard/vault/withdraw" className="w-full py-3 rounded-xl font-bold text-sm text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2">
              <ArrowDownUp className="w-4 h-4" /> Withdraw to Keplr
            </Link>

            {/* Connected Wallet Info */}
            <div className="mt-4 p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Connected Wallet</span>
              </div>
              <p className="text-sm font-mono font-semibold text-zinc-900 dark:text-white mb-1">
                {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '—'}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Network: {networkLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
