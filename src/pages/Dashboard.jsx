import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, Plus, Handshake, LayoutDashboard, Settings, 
    Bell, ChevronRight, Wallet, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';

function Sidebar({ activePath }) {
    const { address } = useWallet();
    const navItems = [
        { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/dashboard', id: '/dashboard' },
        { icon: <Plus size={20}/>, label: 'New Agreement', path: '/create', id: '/create', highlight: true },
        { icon: <Handshake size={20}/>, label: 'My Projects', path: '/dashboard', id: '/projects' },
        { icon: <Bell size={20}/>, label: 'Activity', path: '/dashboard', id: '/activity' },
        { icon: <Settings size={20}/>, label: 'Settings', path: '/dashboard', id: '/settings' },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed hidden md:flex">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-8 h-8 text-[#17B978]" />
                    <span className="text-2xl font-bold tracking-tight text-[#0A3D62]">ACCORD</span>
                </div>
                <div className="text-[10px] font-bold text-teal bg-teal/5 uppercase inline-block px-2 py-1 rounded tracking-widest">
                    Injective Testnet
                </div>
            </div>

            <div className="flex-1 px-4 space-y-1.5 mt-4">
                {navItems.map((item, i) => (
                    <Link key={i} to={item.path} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                            activePath === item.id 
                                ? 'bg-[#0A3D62]/5 text-[#0A3D62]' 
                                : item.highlight 
                                    ? 'text-[#17B978] hover:bg-teal-50' 
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-navy'
                        }`}>
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#17B978] to-[#0A3D62] flex-shrink-0"></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">My Wallet</p>
                        <p className="text-[11px] font-bold text-navy truncate">
                            {address?.slice(0, 8)}...{address?.slice(-4)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('freelancer');
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { address } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (address) fetchAgreements();
    }, [address]);

    const fetchAgreements = async () => {
        try {
            setLoading(true);
            const data = await apiCall('/api/agreements');
            setAgreements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Dashboard fetch error (falling back to mock sample):", error.message);
            // If backend fails, we show its empty or we could show a placeholder
            setAgreements([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAgreements = agreements.filter(item => 
        activeTab === 'freelancer' 
        ? item.freelancer_wallet?.toLowerCase() === address?.toLowerCase() 
        : item.client_wallet?.toLowerCase() === address?.toLowerCase()
    );

    const getStatusStyle = (status) => {
        const s = status?.toString().toUpperCase();
        if (s === 'PENDING' || s === '0') return 'bg-gray-100 text-gray-600';
        if (s === 'FUNDED' || s === '1') return 'bg-blue-100 text-blue-700';
        if (s === 'SUBMITTED' || s === '2') return 'bg-amber-100 text-amber-700';
        if (s === 'COMPLETED' || s === '4') return 'bg-emerald-100 text-emerald-700';
        return 'bg-gray-100 text-gray-500';
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex">
            <Sidebar activePath="/dashboard" />
            
            <div className="flex-1 md:ml-64 p-6 lg:p-10">
                <main className="max-w-5xl mx-auto">
                    
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#0A3D62] tracking-tight">Executive Dashboard</h1>
                            <p className="text-gray-400 text-sm mt-1">Manage your secure Injective agreements.</p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={fetchAgreements}
                                className="p-2.5 text-gray-400 hover:text-teal bg-white border border-gray-100 rounded-xl shadow-sm transition-all"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button 
                                onClick={() => navigate('/create')}
                                className="hidden md:flex items-center gap-2 bg-[#17B978] hover:bg-[#129A64] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <Plus size={20} />
                                Create New
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal/20 transition-all group">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 group-hover:text-teal">Active Escrows</p>
                            <h3 className="text-3xl font-black text-navy">{loading ? '...' : filteredAgreements.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Locked Value</p>
                            <h3 className="text-3xl font-black text-blue-600">
                                ${filteredAgreements.reduce((sum, item) => sum + Number(item.amount_usdt || 0), 0).toFixed(0)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Platform Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#17B978] animate-pulse"></span>
                                <span className="text-lg font-bold text-[#0A3D62]">Mainnet-Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('freelancer')}
                            className={`px-8 py-4 font-bold text-xs uppercase tracking-widest mr-4 border-b-2 transition-all whitespace-nowrap ${activeTab === 'freelancer' ? 'border-[#17B978] text-[#0A3D62]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                        >
                            Open Projects (Freelancer)
                        </button>
                        <button 
                            onClick={() => setActiveTab('client')}
                            className={`px-8 py-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'client' ? 'border-[#17B978] text-[#0A3D62]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                        >
                            Escrows (Client)
                        </button>
                    </div>

                    {/* Content List */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center py-24 text-gray-300">
                                <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                                <p className="font-bold text-sm tracking-widest uppercase">Fetching Agreements...</p>
                            </motion.div>
                        ) : filteredAgreements.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAgreements.map((deal, i) => (
                                    <motion.div 
                                        initial={{opacity: 0, y: 10}} 
                                        animate={{opacity: 1, y: 0}} 
                                        transition={{delay: i*0.05}}
                                        key={deal.id} 
                                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:shadow-xl hover:border-teal/30 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/deal/${deal.id}`)}
                                    >
                                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                                            <div className={`p-4 rounded-2xl flex items-center justify-center ${getStatusStyle(deal.status)}`}>
                                                <Handshake className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                     <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusStyle(deal.status)} shadow-sm`}>
                                                        {deal.status || 'Draft'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">#{deal.id?.slice(0, 8)}</span>
                                                </div>
                                                <h4 className="font-black text-xl text-navy leading-tight">{deal.title}</h4>
                                                <p className="text-xs font-bold text-gray-400 mt-0.5">
                                                    Parties: {address?.slice(0, 4)}... ↔ {deal.client_wallet?.slice(0, 8) || 'Unknown'}...
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Contract Value</p>
                                                <span className="text-2xl font-black text-navy">{deal.amount_usdt} <span className="text-sm font-bold text-teal">USDT</span></span>
                                            </div>
                                            <div className="bg-gray-50 group-hover:bg-[#17B978] group-hover:text-white transition-all p-3 rounded-2xl border border-gray-100 text-gray-300">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{opacity: 0}} 
                                animate={{opacity: 1}} 
                                className="bg-white border-2 border-dashed border-gray-100 rounded-[40px] p-20 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <LayoutDashboard className="w-8 h-8 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-2 tracking-tight">Zero Project Activity</h3>
                                <p className="text-gray-400 max-w-sm mb-8 font-bold text-sm tracking-tight leading-relaxed">
                                    No active escrows found on the Injective network for this wallet. Create a new deal to initiate the Kofi flow.
                                </p>
                                <button 
                                    onClick={() => navigate('/create')}
                                    className="px-10 py-4 bg-[#17B978] text-white rounded-full font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95"
                                >
                                    Launch First Agreement
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
            
            <button 
                onClick={() => navigate('/create')} 
                className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-[#17B978] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 z-50 text-2xl font-black"
            >
                +
            </button>
        </div>
    );
}
