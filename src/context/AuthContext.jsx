// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global auth state. Wrap your entire app with <AuthProvider>.
// Any component can call useAuth() to get user info.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getUserByWallet } from "../lib/supabaseHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount(); // Thirdweb hook — works for both external wallets and generated wallets
  const [user, setUser] = useState(null);  // Full user record from Supabase
  const [loading, setLoading] = useState(true);

  // Whenever wallet connects/disconnects → sync with Supabase
  useEffect(() => {
    async function syncUser() {
      // If Thirdweb is still determining the account state, stay in loading
      if (activeAccount === undefined) {
        setLoading(true);
        return;
      }

      if (!activeAccount?.address) {
        console.log("AuthContext: No active account address found.");
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        console.log("AuthContext: Syncing user for address:", activeAccount.address);
        const data = await getUserByWallet(activeAccount.address);
        console.log("AuthContext: Supabase data received:", !!data);
        setUser(data);
      } catch (err) {
        console.error("AuthContext: syncUser CRITICAL ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    syncUser();
  }, [activeAccount]);

  const value = {
    walletAddress: activeAccount?.address || null,
    isConnected: !!activeAccount?.address,
    user,          // full Supabase user row
    loading,
    setUser,       // allow components to refresh user after updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook — use this anywhere in your app
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
