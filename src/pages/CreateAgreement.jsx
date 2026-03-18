import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Copy, ExternalLink, CalendarDays } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function CreateAgreement() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', clientWallet: '', amount: '', revisions: 1, deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLink, setSuccessLink] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate smart contract interaction and backend save
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessLink(`https://accord.app/agreement/acc-1234-5678`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 border-r border-gray-100 pr-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#17B978]" />
            <span className="text-xl font-bold tracking-tight text-[#0A3D62]">ACCORD</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">{address?.substring(0, 6)}...{address?.substring(38)}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form (60%) */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0A3D62] mb-2">Create New Agreement</h1>
              <p className="text-gray-500 text-lg">Your client will review and deposit payment before you begin work.</p>
            </div>

            {successLink ? (
              <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-white p-10 rounded-2xl shadow-lg border border-green-100 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-bold text-[#0A3D62] mb-3">Agreement Created Successfully!</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Send this secure link to your client. They will be prompted to deposit the payment into the smart contract escrow.</p>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between mb-8">
                  <span className="text-gray-800 font-mono text-sm truncate pr-4">{successLink}</span>
                  <button className="flex items-center gap-2 text-[#17B978] font-semibold hover:text-[#0A3D62] transition-colors whitespace-nowrap">
                    <Copy size={16}/> Copy
                  </button>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl border-2 border-[#0A3D62] text-[#0A3D62] font-semibold hover:bg-gray-50 transition-colors">
                    Back to Dashboard
                  </button>
                  <button onClick={() => navigate('/agreement/1')} className="px-6 py-3 rounded-xl bg-[#17B978] text-white font-semibold hover:bg-[#129a64] shadow-md shadow-green-100 transition-colors">
                    Open Agreement Room
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <form onSubmit={handleCreate} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Job Title</label>
                    <input 
                      type="text" required placeholder="e.g. Identity Design for TechBrand"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#17B978] focus:ring-2 focus:ring-[#17B978]/20 outline-none transition-all text-gray-800"
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Deliverables Description</label>
                    <textarea 
                      required rows="4" placeholder="Describe exactly what you will deliver..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#17B978] focus:ring-2 focus:ring-[#17B978]/20 outline-none transition-all resize-none text-gray-800"
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Client Wallet Address</label>
                    <input 
                      type="text" required placeholder="0x..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#17B978] focus:ring-2 focus:ring-[#17B978]/20 outline-none transition-all font-mono text-gray-800"
                      onChange={(e) => setFormData({...formData, clientWallet: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-2">Only this specific wallet address will be able to approve the work and release the payment.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Payment Amount</label>
                      <div className="relative">
                        <input 
                          type="number" required placeholder="0.00" min="1" step="0.01"
                          className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-200 focus:border-[#17B978] focus:ring-2 focus:ring-[#17B978]/20 outline-none transition-all text-gray-800"
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                        <div className="absolute right-3 top-3 px-2 py-0.5 bg-blue-50 text-[#0A3D62] font-bold text-sm rounded pointer-events-none">USDT</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Deadline (Optional)</label>
                      <div className="relative">
                        <input 
                          type="date"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#17B978] focus:ring-2 focus:ring-[#17B978]/20 outline-none transition-all text-gray-800"
                          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        />
                        <CalendarDays className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A3D62] mb-2">Maximum Revisions Allowed</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({...formData, revisions: num})}
                          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.revisions === num ? 'bg-white shadow text-[#17B978]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-8 border-t border-gray-100">
                    <button 
                      type="submit" disabled={isSubmitting}
                      className="w-full py-4 bg-[#17B978] hover:bg-[#129a64] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_0_rgba(23,185,120,0.39)] hover:shadow-[0_6px_20px_rgba(23,185,120,0.23)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'Create Agreement & Generate Link'
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>

          {/* Right Column: Live Preview (40%) */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4 text-[#0A3D62]">
                <ExternalLink size={18} />
                <span className="font-semibold text-sm">Preview — What your client will see</span>
              </div>
              
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative group">
                {/* Simulated URL bar */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-4 flex-1 bg-white rounded flex px-3 py-1 text-xs text-gray-500">
                    accord.app/agreement/acc-preview
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-8 border-b pb-4">
                    <ShieldCheck className="w-6 h-6 text-[#17B978]" />
                    <span className="text-xl font-bold tracking-tight text-[#0A3D62]">ACCORD</span>
                  </div>

                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wide mb-3">PENDING PAYMENT</span>
                    <h3 className="text-2xl font-bold text-[#0A3D62] leading-tight mb-2">
                      {formData.title || "Job Title Goes Here"}
                    </h3>
                    <div className="flex text-sm text-gray-500 gap-4 mt-3">
                      <div>From: <span className="font-mono text-gray-800">{address ? `${address.substring(0,8)}...` : '0x...'}</span></div>
                      <div>To: <span className="font-mono text-gray-800">{formData.clientWallet ? `${formData.clientWallet.substring(0,8)}...` : '0x...'}</span></div>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-5 rounded-xl border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Amount Due</span>
                      <span className="text-3xl font-bold text-[#0A3D62]">{formData.amount || "0.00"} <span className="text-lg text-gray-500">USDT</span></span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-sm font-bold text-[#0A3D62] mb-1">Deliverables</h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {formData.description || "Description of exactly what will be delivered."}
                      </p>
                    </div>
                    <div className="flex gap-6 pt-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revisions</h4>
                        <span className="text-sm font-semibold text-gray-800">{formData.revisions} Allowed</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Deadline</h4>
                        <span className="text-sm font-semibold text-gray-800">{formData.deadline || "No strict deadline"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-50">
                    <button className="w-full py-4 bg-[#17B978] text-white text-lg font-bold rounded-xl cursor-not-allowed">
                      Deposit Funds
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">Mock button for preview only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
