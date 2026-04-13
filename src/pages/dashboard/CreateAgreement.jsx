import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, User, Plus, Trash2, ChevronDown, Wallet, DollarSign
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { getAddressBookEntries } from '../../lib/supabaseHelpers';
import { apiCall } from '../../utils/api';
import { ethers } from 'ethers';
import { USDC_ADDRESS } from '../../utils/contractABI';

const WORK_TYPES = [
  'Graphics Design', 'Video Editing', 'Music Production', 'Photography',
  'Copywriting', 'UI/UX Design', 'Web Development', 'Other',
];

export default function CreateAgreement() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundingSource, setFundingSource] = useState('vault');
  const [addressBook, setAddressBook] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');

  const [form, setForm] = useState({
    title: '',
    workType: 'Graphics Design',
    counterpartyAddress: '',
  });

  const [items, setItems] = useState([
    { name: '', description: '', amount: '' },
  ]);

  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const addItem = () => setItems([...items, { name: '', description: '', amount: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));

  useEffect(() => {
    if (!address) {
      return;
    }

    let isMounted = true;

    const loadAddressBook = async () => {
      try {
        const entries = await getAddressBookEntries(address);
        if (isMounted) {
          setAddressBook(entries);
        }
      } catch (error) {
        console.error('Failed to load address book:', error);
      }
    };

    loadAddressBook();
    return () => {
      isMounted = false;
    };
  }, [address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const contractAgreementId = ethers.hexlify(ethers.randomBytes(32));
      const isFreelancer = role === 'freelancer';

      const agreement = await apiCall('/api/agreements', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: items.map((i) => `${i.name}: ${i.description}`).join('\n'),
          client_wallet: isFreelancer ? form.counterpartyAddress.toLowerCase() : address.toLowerCase(),
          freelancer_wallet: isFreelancer ? address.toLowerCase() : form.counterpartyAddress.toLowerCase(),
          amount: totalAmount.toFixed(2),
          token_address: USDC_ADDRESS,
          max_revisions: 3,
          contract_agreement_id: contractAgreementId,
          status: 'PENDING',
        }),
      });
      navigate(`/deal/${agreement.id}`);
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Select your role</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Choose how you're participating in this agreement</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              key: 'freelancer',
              icon: '🎨',
              title: 'As a Freelancer',
              desc: 'I am delivering work',
              IconComp: User,
            },
            {
              key: 'client',
              icon: '💼',
              title: 'As a Client',
              desc: 'I am paying for work',
              IconComp: Briefcase,
            },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`p-6 rounded-2xl text-left border-2 transition-all hover:shadow-md ${
                role === r.key
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                  : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-orange-300 dark:hover:border-orange-500/40'
              }`}
            >
              <span className="text-3xl mb-4 block">{r.icon}</span>
              <h3 className={`text-base font-bold mb-1 ${role === r.key ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-white'}`}>
                {r.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{r.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => role && setStep(2)}
          disabled={!role}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_6px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_28px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => setStep(1)} className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white mb-3 flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Create {role === 'freelancer' ? 'Freelancer' : 'Client'} Agreement
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Create a new agreement and share its link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Agreement Details */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 p-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Agreement Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Agreement Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Logo Design for TechBrand"
                className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Work Type</label>
              <div className="relative">
                <select
                  value={form.workType}
                  onChange={(e) => setForm({ ...form, workType: e.target.value })}
                  className="appearance-none w-full px-3 py-2.5 pr-8 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white cursor-pointer"
                >
                  {WORK_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                {role === 'freelancer' ? 'Client Wallet Address' : 'Freelancer Wallet Address'}
              </label>
              {addressBook.length > 0 && (
                <div className="relative mb-2">
                  <select
                    value={selectedSavedAddress}
                    onChange={(e) => {
                      setSelectedSavedAddress(e.target.value);
                      setForm({ ...form, counterpartyAddress: e.target.value });
                    }}
                    className="appearance-none w-full px-3 py-2.5 pr-8 text-sm bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white cursor-pointer"
                  >
                    <option value="">Select from address book</option>
                    {addressBook.map((entry) => (
                      <option key={entry.id} value={entry.saved_address}>
                        {entry.nickname} - {entry.saved_address.slice(0, 6)}...{entry.saved_address.slice(-4)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              )}
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  required
                  value={form.counterpartyAddress}
                  onChange={(e) => {
                    setSelectedSavedAddress('');
                    setForm({ ...form, counterpartyAddress: e.target.value });
                  }}
                  placeholder="0x..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Items */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 p-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Work Items</h2>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Item {i + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    required
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    placeholder="Item Name"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-lg outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400"
                  />
                  <textarea
                    rows="2"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    placeholder="Item Description"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-lg outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400 resize-none"
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => updateItem(i, 'amount', e.target.value)}
                      placeholder="Amount ($)"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-lg outline-none focus:border-orange-400 text-zinc-900 dark:text-white placeholder-zinc-400"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Funding */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-zinc-200 dark:border-white/5 p-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Funding</h2>
          <div className="mb-4">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">${totalAmount.toFixed(2)}</span>
            <span className="text-sm text-zinc-400 ml-2">Total</span>
          </div>
          <div className="space-y-2">
            {[
              { key: 'vault', label: 'From Vault', desc: 'Use your vault balance' },
              { key: 'keplr', label: 'Direct from Keplr', desc: 'Pull from connected wallet' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                <input
                  type="radio"
                  name="funding"
                  value={opt.key}
                  checked={fundingSource === opt.key}
                  onChange={() => setFundingSource(opt.key)}
                  className="accent-orange-500"
                />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-zinc-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_6px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_28px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating Agreement...
            </span>
          ) : (
            'Create Agreement'
          )}
        </button>
      </form>
    </div>
  );
}
