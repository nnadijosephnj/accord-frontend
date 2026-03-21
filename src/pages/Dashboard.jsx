import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { apiCall } from '../utils/api';
import { Plus, Layout, Briefcase, User, LogOut, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { address, logout } = useWallet();
    const navigate = useNavigate();
    const [agreements, setAgreements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('freelancer'); // 'freelancer' or 'client'

    useEffect(() => {
        if (!address) {
            navigate('/');
            return;
        }
        fetchAgreements();
    }, [address]);

    const fetchAgreements = async () => {
        try {
            setIsLoading(true);
            const data = await apiCall('/api/agreements');
            setAgreements(data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAgreements = agreements.filter(item => 
        activeTab === 'freelancer' 
        ? item.freelancer_address === address 
        : item.client_address === address
    );

    const getStatusColor = (status) => {
        switch(status) {
            case 0: return 'bg-gray-100 text-gray-600'; // PENDING
            case 1: return 'bg-blue-100 text-blue-600'; // FUNDED
            case 2: return 'bg-yellow-100 text-yellow-600'; // SUBMITTED
            case 3: return 'bg-orange-100 text-orange-600'; // REVISION
            case 4: return 'bg-green-100 text-green-600'; // COMPLETED
            case 5: return 'bg-red-100 text-red-600'; // CANCELLED
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status) => {
        const statuses = ['PENDING', 'FUNDED', 'SUBMITTED', 'REVISION', 'COMPLETED', 'CANCELLED'];
        return statuses[status] || 'UNKNOWN';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-navy text-white flex flex-col fixed h-full shadow-2xl z-20">
                <div className="p-8 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight italic">Accord</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-teal font-medium">
                        <Layout className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/create" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all">
                        <Plus className="w-5 h-5" /> New Agreement
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Welcome back</h1>
                        <p className="text-gray-500 mt-1">Manage your professional service agreements</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-full flex items-center gap-2 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </div>
                        <Link to="/create" className="px-5 py-2.5 bg-teal text-white rounded-full font-bold shadow-lg hover:shadow-teal/20 active:scale-95 transition-all flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Create
                        </Link>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    <button 
                        onClick={() => setActiveTab('freelancer')}
                        className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'freelancer' ? 'text-navy' : 'text-gray-400'}`}
                    >
                        <span className="flex items-center gap-2 italic">
                            <Briefcase className="w-4 h-4" /> AS FREELANCER
                        </span>
                        {activeTab === 'freelancer' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'client' ? 'text-navy' : 'text-gray-400'}`}
                    >
                        <span className="flex items-center gap-2 italic">
                            <User className="w-4 h-4" /> AS CLIENT
                        </span>
                        {activeTab === 'client' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
                    </button>
                </div>

                {/* Agreement Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal" />
                        <p className="font-medium">Loading your agreements...</p>
                    </div>
                ) : filteredAgreements.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-dashed border-gray-200 rounded-[32px] py-32 flex flex-col items-center text-center px-6"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Layout className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-navy mb-2">No agreements found</h3>
                        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed italic">
                            {activeTab === 'freelancer' 
                                ? "You haven't created any agreements as a freelancer yet." 
                                : "No one has sent you an agreement to fund yet."}
                        </p>
                        <Link to="/create" className="px-8 py-3 bg-navy text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
                            Create your first Agreement
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode='popLayout'>
                        {filteredAgreements.map((deal) => (
                            <motion.div 
                                key={deal.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${getStatusColor(deal.status)}`}>
                                        {getStatusText(deal.status)}
                                    </div>
                                    <span className="text-2xl font-black text-navy">{deal.amount || '0'} <span className="text-xs text-gray-400 font-bold tracking-normal">USDT</span></span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-navy mb-2 line-clamp-1 group-hover:text-teal transition-colors italic">
                                    {deal.title || 'Untitled Project'}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                    {deal.description || 'No description provided.'}
                                </p>

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider italic">
                                            {activeTab === 'freelancer' ? 'Client' : 'Freelancer'}
                                        </span>
                                        <span className="text-xs font-bold text-navy">
                                            {activeTab === 'freelancer' 
                                                ? `${deal.client_address?.slice(0,6)}...${deal.client_address?.slice(-4)}`
                                                : `${deal.freelancer_address?.slice(0,6)}...${deal.freelancer_address?.slice(-4)}`}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/deal/${deal.id}`}
                                        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-navy hover:bg-teal hover:text-white transition-all shadow-inner"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
