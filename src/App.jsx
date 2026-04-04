import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';

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
  return (
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
  );
}

function ProtectedRoute({ children }) {
  const { address } = useWallet();
  if (!address) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
