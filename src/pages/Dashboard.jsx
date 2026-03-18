import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Handshake, LayoutDashboard, Settings, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, Link } from 'react-router-dom';

function Sidebar() {
  const { address } = useWallet();
  const navItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: <Handshake size={20}/>, label: 'My Agreements', path: '/dashboard', active: false },
    { icon: <Plus size={20}/>, label: 'Create Agreement', path: '/create', active: false, highlight: true },
    { icon: <Bell size={20}/>, label: 'Notifications', path: '/dashboard', active: false },
    { icon: <Settings size={20}/>, label: 'Settings', path: '/dashboard', active: false },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#17B978]" />
          <span className="text-2xl font-bold tracking-tight text-[#0A3D62]">ACCORD</span>
        </div>
        <div className="text-xs font-semibold text-gray-400 bg-gray-50 uppercase inline-block px-2 py-1 rounded">
          Injective Network
        </div>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item, i) => (
          <Link key={i} to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              item.active 
                ? 'bg-[#0A3D62]/5 text-[#0A3D62]' 
                : item.highlight 
                  ? 'text-[#17B978] hover:bg-teal-50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#17B978] to-[#0A3D62] shadow-inner border-2 border-white flex-shrink-0"></div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 font-medium">Connected Wallet</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {address?.substring(0, 6)}...{address?.substring(38)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('freelancer');
  const navigate = useNavigate();

  // Mock data for UI presentation
  const mockAgreements = [
    { id: '1', title: 'Logo Design for TechStartup', otherWallet: '0x123...abc', amount: '500.00', status: 'FUNDED', date: 'Oct 12' },
    { id: '2', title: 'React Frontend Development', otherWallet: '0x456...def', amount: '1200.00', status: 'SUBMITTED', date: 'Oct 14' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'FUNDED': return 'bg-blue-100 text-blue-700';
      case 'SUBMITTED': return 'bg-amber-100 text-amber-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-6 lg:p-10">
        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="max-w-5xl mx-auto">
          
          <h1 className="text-3xl font-bold text-[#0A3D62] mb-8">Dashboard</h1>

          {/* Top Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium mb-1">Active Agreements</p>
              <h3 className="text-3xl font-bold text-blue-600">3</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium mb-1">Completed</p>
              <h3 className="text-3xl font-bold text-green-500">12</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium mb-1">Total USDT Transacted</p>
              <h3 className="text-3xl font-bold text-[#0A3D62]">$4,250</h3>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTab('freelancer')}
              className={`px-8 py-4 font-semibold text-sm mr-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'freelancer' ? 'border-[#17B978] text-[#0A3D62]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
            >
              As Freelancer
            </button>
            <button 
              onClick={() => setActiveTab('client')}
              className={`px-8 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'client' ? 'border-[#17B978] text-[#0A3D62]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
            >
              As Client
            </button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {mockAgreements.map((item, i) => (
              <motion.div 
                initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: i*0.1}}
                key={item.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => navigate(`/agreement/${item.id}`)}
              >
                <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">Client: {item.otherWallet} • Created: {item.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#0A3D62]">{item.amount} USDT</span>
                  </div>
                  <button className="bg-[#17B978]/10 text-[#17B978] group-hover:bg-[#17B978] group-hover:text-white transition-colors p-3 rounded-xl">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
      
      {/* Mobile Create Floating Button */}
      <button onClick={() => navigate('/create')} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#17B978] text-white rounded-full shadow-lg flex items-center justify-center">
        <Plus size={24}/>
      </button>
    </div>
  );
}
