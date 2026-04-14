import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import DashboardLayout from "./components/DashboardLayout";
import NetworkBanner from "./components/NetworkBanner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NetworkProvider } from "./context/NetworkContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WalletProvider } from "./context/WalletContext";
import { client } from "./lib/thirdwebClient";
import AgreementRoom from "./pages/AgreementRoom";
import Landing from "./pages/Landing";
import ConnectedWallet from "./pages/dashboard/ConnectedWallet";
import CreateAgreement from "./pages/dashboard/CreateAgreement";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import Disputes from "./pages/dashboard/Disputes";
import MyAgreements from "./pages/dashboard/MyAgreements";
import MyDeals from "./pages/dashboard/MyDeals";
import Notifications from "./pages/dashboard/Notifications";
import Overview from "./pages/dashboard/Overview";
import ReceivedLinks from "./pages/dashboard/ReceivedLinks";
import VaultPage from "./pages/dashboard/Vault";
import WithdrawPage from "./pages/dashboard/WithdrawPage";

function DashboardWrapper({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  useEffect(() => {
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
          <NetworkProvider>
            <Router>
              <WalletProvider>
                <NetworkBanner />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard/overview" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/overview"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <Overview />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/agreements"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <MyAgreements />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/agreements/create"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <CreateAgreement />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/agreements/deals"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <MyDeals />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/agreements/received"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <ReceivedLinks />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/vault"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <VaultPage />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/vault/withdraw"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <WithdrawPage />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/vault/wallet"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <ConnectedWallet />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/notifications"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <Notifications />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/disputes"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <Disputes />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper>
                          <DashboardSettings />
                        </DashboardWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/agreement/:id" element={<AgreementRoom />} />
                  <Route path="/deal/:id" element={<AgreementRoom />} />
                  <Route
                    path="/create/freelancer"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard/agreements/create" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create/client"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard/agreements/create" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard/settings" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </WalletProvider>
            </Router>
          </NetworkProvider>
        </ThemeProvider>
      </AuthProvider>
    </ThirdwebProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isConnected, loading } = useAuth();
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkip(false);
      return;
    }

    const timeout = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--accord-background)] px-6">
        <div className="surface-card flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--accord-primary-line)] border-t-[var(--accord-primary)] animate-spin" />
          <div>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accord-primary)]">
              Entering Accord
            </span>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">Checking your wallet session and loading your workspace.</p>
            {showSkip ? (
              <button type="button" onClick={() => (window.location.href = "/")} className="secondary-button mt-4 px-4 py-2 text-xs">
                Return Home
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;


