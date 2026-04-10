import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThirdwebProvider, useActiveAccount } from "thirdweb/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { client } from "./lib/thirdwebClient";
// AuthPage removed as it is now integrated into Landing
import Landing from './pages/Landing';

import AgreementRoom from './pages/AgreementRoom';

// Dashboard Layout
import DashboardLayout from './components/DashboardLayout';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import MyAgreements from './pages/dashboard/MyAgreements';
import CreateAgreement from './pages/dashboard/CreateAgreement';
import MyDeals from './pages/dashboard/MyDeals';
import ReceivedLinks from './pages/dashboard/ReceivedLinks';
import VaultPage from './pages/dashboard/Vault';
import WithdrawPage from './pages/dashboard/WithdrawPage';
import ConnectedWallet from './pages/dashboard/ConnectedWallet';
import Notifications from './pages/dashboard/Notifications';
import Disputes from './pages/dashboard/Disputes';
import DashboardSettings from './pages/dashboard/DashboardSettings';

function DashboardWrapper({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

function App() {
  React.useEffect(() => {
    const handleError = (error) => {
      console.error("GLOBAL ERROR CAUGHT:", error);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return (
    <ThirdwebProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <WalletProvider>
            <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Redirect /dashboard -> /dashboard/overview */}
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/overview" replace /></ProtectedRoute>} />

            {/* Dashboard Pages */}
            <Route
              path="/dashboard/overview"
              element={<ProtectedRoute><DashboardWrapper><Overview /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/agreements"
              element={<ProtectedRoute><DashboardWrapper><MyAgreements /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/agreements/create"
              element={<ProtectedRoute><DashboardWrapper><CreateAgreement /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/agreements/deals"
              element={<ProtectedRoute><DashboardWrapper><MyDeals /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/agreements/received"
              element={<ProtectedRoute><DashboardWrapper><ReceivedLinks /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/vault"
              element={<ProtectedRoute><DashboardWrapper><VaultPage /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/vault/withdraw"
              element={<ProtectedRoute><DashboardWrapper><WithdrawPage /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/vault/wallet"
              element={<ProtectedRoute><DashboardWrapper><ConnectedWallet /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/notifications"
              element={<ProtectedRoute><DashboardWrapper><Notifications /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/disputes"
              element={<ProtectedRoute><DashboardWrapper><Disputes /></DashboardWrapper></ProtectedRoute>}
            />
            <Route
              path="/dashboard/settings"
              element={<ProtectedRoute><DashboardWrapper><DashboardSettings /></DashboardWrapper></ProtectedRoute>}
            />

            {/* Agreement Room (public/private handled inside) */}
            <Route path="/agreement/:id" element={<AgreementRoom />} />
            <Route path="/deal/:id" element={<AgreementRoom />} />

            {/* Legacy routes — redirect old create pages to new flow */}
            <Route path="/create/freelancer" element={<ProtectedRoute><Navigate to="/dashboard/agreements/create" replace /></ProtectedRoute>} />
            <Route path="/create/client" element={<ProtectedRoute><Navigate to="/dashboard/agreements/create" replace /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Navigate to="/dashboard/settings" replace /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </Router>
          </WalletProvider>
        </ThemeProvider>
      </AuthProvider>
    </ThirdwebProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isConnected, isGuest, loading } = useAuth();
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setShowSkip(true), 4000);
      return () => clearTimeout(t);
    }
  }, [loading]);
  
  if (loading) {
    const isLoggingOut = !isConnected && !isGuest && window.location.pathname.startsWith('/dashboard');

    return <div className="h-screen w-full flex items-center justify-center bg-[#f5f6f7] dark:bg-[#0e0e0e]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
            <span className="text-zinc-500 font-bold italic tracking-widest text-sm uppercase block">
              {isLoggingOut ? 'Signing Out...' : 'Entering Accord...'}
            </span>
            {showSkip && !isLoggingOut && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 text-[10px] text-orange-500 font-black uppercase tracking-widest hover:underline"
                >
                    Taking too long? Click to Refresh
                </button>
            )}
        </div>
      </div>
    </div>;
  }
  
  if (!isConnected && !isGuest) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
