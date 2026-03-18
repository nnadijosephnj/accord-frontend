import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Download, CheckCircle, Clock, Undo2, Ban, Send, FileCode } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, useParams } from 'react-router-dom';

export default function AgreementRoom() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mocks
  const role = 'client'; // mock
  const [status, setStatus] = useState('SUBMITTED'); // PENDING, FUNDED, SUBMITTED, REVISION, COMPLETED, CANCELLED
  const isFreelancer = role === 'freelancer';
  const isClient = role === 'client';

  const timelineSteps = [
    { label: 'Created', active: true, done: true },
    { label: 'Payment Locked', active: status !== 'PENDING', done: status !== 'PENDING' },
    { label: 'Work Submitted', active: ['SUBMITTED','REVISION','COMPLETED'].includes(status), done: ['SUBMITTED','REVISION','COMPLETED'].includes(status) },
    { label: 'Completed', active: status === 'COMPLETED', done: status === 'COMPLETED' },
  ];

  const handleDeposit = () => setStatus('FUNDED');
  const handleApprove = () => setStatus('COMPLETED');
  const handleRevision = () => setStatus('REVISION');

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 border-r border-gray-100 pr-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#17B978]" />
            <span className="text-xl font-bold tracking-tight text-[#0A3D62]">ACCORD Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">View AS: {role}</span>
          <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">{address?.substring(0, 6)}...{address?.substring(38)}</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        
        {/* Header Card */}
        <motion.div initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 ${status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {status}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A3D62] mb-1">E-Commerce UI Design System</h1>
              <p className="text-sm text-gray-500">Created Oct 14, 2026 • Contract ID: #10492</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-right md:min-w-[200px]">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Escrow Amount</p>
              <h2 className="text-3xl font-bold text-[#0A3D62]">1,200.00 <span className="text-lg text-gray-400">USDT</span></h2>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pt-6 border-t border-gray-100">
            <div className="absolute top-[42px] left-6 right-6 h-1 bg-gray-100 rounded-full z-0"></div>
            
            <div className="flex justify-between relative z-10 w-full">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                    step.done ? 'bg-[#17B978] text-white shadow-[0_0_10px_rgba(23,185,120,0.4)]' : 
                    step.active ? 'bg-amber-400 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'
                  }`}>
                    {step.done ? <CheckCircle size={16}/> : i+1}
                  </div>
                  <span className={`text-xs font-bold ${step.active ? 'text-[#0A3D62]' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two Panel Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* File Preview Card (If Submitted) */}
            {['SUBMITTED', 'REVISION', 'COMPLETED'].includes(status) && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#0A3D62] mb-4 flex items-center gap-2">
                  <FileCode className="text-[#17B978]"/> Delivery Preview
                </h3>
                
                <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-200 flex items-center justify-center min-h-[300px] mb-4 group select-none">
                  {/* Fake work preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 grid grid-cols-4 grid-rows-4 gap-2 p-6 opacity-30">
                     <div className="bg-gray-700 rounded-lg col-span-4 h-12"></div>
                     <div className="bg-gray-700 rounded-lg col-span-1 h-32"></div>
                     <div className="bg-gray-700 rounded-lg col-span-3 h-32"></div>
                     <div className="bg-gray-700 rounded-lg col-span-2 h-20"></div>
                     <div className="bg-gray-700 rounded-lg col-span-2 h-20"></div>
                  </div>
                  
                  {/* Watermark Overlay */}
                  {status !== 'COMPLETED' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 backdrop-blur-[2px]">
                       <div className="transform -rotate-12 border-4 border-white/20 px-8 py-4 rounded-xl text-center">
                          <p className="text-4xl font-black tracking-widest text-white/40 shadow-black">ACCORD PREVIEW</p>
                          <p className="text-xl font-bold tracking-wider text-white/30 truncate">PENDING APPROVAL</p>
                       </div>
                    </div>
                  )}

                  {/* Completion overlay */}
                  {status === 'COMPLETED' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-green-500/10 mix-blend-color"></div>
                  )}
                </div>

                <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                      <Download size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0A3D62]">UI_System_Final.fig</p>
                      <p className="text-xs text-gray-500">24.5 MB • Uploaded 2 hours ago</p>
                    </div>
                  </div>
                  {status === 'COMPLETED' ? (
                    <button className="text-sm font-bold text-white bg-[#17B978] px-4 py-2 rounded-lg hover:bg-[#129a64] transition-colors">Download Source</button>
                  ) : (
                    <button className="text-sm font-bold text-gray-500 bg-gray-200 px-4 py-2 rounded-lg cursor-not-allowed">Locked by Contract</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Activity Feed */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#0A3D62]">Activity Log</h3>
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pl-6">
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-white p-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold mb-1">Oct 14, 10:00 AM</p>
                    <p className="text-sm text-[#0A3D62] font-semibold">Agreement Created by Freelancer</p>
                  </div>

                  {status !== 'PENDING' && (
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-white p-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Oct 14, 1:30 PM</p>
                      <p className="text-sm text-[#0A3D62] font-semibold">Client deposited 1,200 USDT to contract</p>
                    </div>
                  )}

                  {['SUBMITTED','REVISION','COMPLETED'].includes(status) && (
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-white p-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Today, 2:45 PM</p>
                      <p className="text-sm text-[#0A3D62] font-semibold">Freelancer submitted watermarked preview</p>
                    </div>
                  )}

                  {status === 'COMPLETED' && (
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-white p-1">
                        <div className="w-3 h-3 rounded-full bg-[#17B978]"></div>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Just now</p>
                      <p className="text-sm font-bold text-green-600">Client approved work. Payment released.</p>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            {/* Action Panel Sticky */}
            <div className="sticky top-24">
              
              <AnimateActionPanel>
                {/* ---------- CLIENT ACTIONS ---------- */}
                {isClient && status === 'PENDING' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-[#0A3D62] mb-3">Deposit Required</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">Please lock your payment in the Accord escrow. The freelancer will begin working immediately after this step.</p>
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-8">
                      <LockKeyhole className="mt-0.5 shrink-0"/>
                      <p className="text-sm">Your funds are held securely on the blockchain. Accord cannot access them. You control when to release payment.</p>
                    </div>
                    <button onClick={handleDeposit} className="w-full py-4 bg-[#17B978] hover:bg-[#129a64] text-white font-bold rounded-xl shadow-md transition-colors text-lg flex justify-center items-center">
                      Deposit 1,200 USDT
                    </button>
                  </div>
                )}

                {isClient && status === 'FUNDED' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                      <LockKeyhole size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0A3D62] mb-3">Payment Secured</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">The smart contract has verified your deposit. The freelancer has been notified and is working on your project.</p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[10%] animate-pulse"></div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">Waiting for delivery</p>
                  </div>
                )}

                {isClient && status === 'SUBMITTED' && (
                  <div className="bg-white rounded-2xl shadow-lg border-t-8 border-t-amber-400 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-[#0A3D62] mb-2">Review Delivery</h3>
                    <p className="text-gray-500 mb-6">The freelancer has submitted the work. Please review the watermarked preview.</p>
                    
                    <button onClick={handleApprove} className="w-full py-4 mb-4 bg-[#17B978] hover:bg-[#129a64] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(23,185,120,0.39)] transition-all flex justify-center items-center gap-2 text-lg">
                      <CheckCircle/> Approve & Release Payment
                    </button>
                    
                    <button onClick={handleRevision} className="w-full py-3 mb-4 border-2 border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors flex justify-center items-center gap-2">
                      <Undo2 size={18}/> Request Revision (3 left)
                    </button>

                    <button className="w-full py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors flex justify-center items-center gap-2">
                      <Ban size={18}/> Cancel Agreement
                    </button>
                  </div>
                )}

                {/* ---------- COMPLETED STATE (BOTH) ---------- */}
                {status === 'COMPLETED' && (
                  <div className="bg-white rounded-2xl shadow-lg border-t-8 border-t-[#17B978] p-6 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0A3D62] mb-2">Agreement Complete</h3>
                    <p className="text-gray-500 mb-6">
                      {isClient ? "You have successfully approved the work and the final source file is unlocked." : "The client has approved the work. 1,200 USDT has been transferred to your wallet."}
                    </p>
                    <div className="text-xs text-gray-400 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 break-all mb-4">
                      Tx: 0x8a92f8d...c1a93b4f
                    </div>
                  </div>
                )}
              </AnimateActionPanel>

              {/* Chat Thread */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-6 flex flex-col h-[300px]">
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-bold text-[#0A3D62] flex items-center gap-2">
                     Workspace Notes
                  </h4>
                </div>
                <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
                  <div className="self-end bg-[#0A3D62] text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                    Hi! I've started the design. I will send the first draft soon.
                  </div>
                  <div className="self-start bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%] text-sm">
                    Great, looking forward to it. Please ensure the colors match our brand guidelines.
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100 relative">
                  <input type="text" placeholder="Type a message..." className="w-full bg-gray-100 rounded-xl py-3 pl-4 pr-12 outline-none text-sm"/>
                  <button className="absolute right-5 top-5 text-[#17B978] hover:text-[#0A3D62] transition-colors">
                    <Send size={18}/>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimateActionPanel({ children }) {
  return (
    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:0.3}}>
      {children}
    </motion.div>
  )
}
