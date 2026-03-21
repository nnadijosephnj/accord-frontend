import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateFreelancer from './pages/CreateFreelancer';
import CreateClient from './pages/CreateClient';
import Profile from './pages/Profile';
import AgreementRoom from './pages/AgreementRoom';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Post-Login Routing */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create/freelancer" element={<ProtectedRoute><CreateFreelancer /></ProtectedRoute>} />
          <Route path="/create/client" element={<ProtectedRoute><CreateClient /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Room Access (Public/Private handled inside) */}
          <Route path="/agreement/:id" element={<AgreementRoom />} />
          <Route path="/deal/:id" element={<AgreementRoom />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </WalletProvider>
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
