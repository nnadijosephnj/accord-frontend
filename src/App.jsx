import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateAgreement from './pages/CreateAgreement';
import AgreementRoom from './pages/AgreementRoom';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateAgreement /></ProtectedRoute>} />
          <Route path="/agreement/:id" element={<AgreementRoom />} />
          <Route path="/deal/:id" element={<AgreementRoom />} />
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
