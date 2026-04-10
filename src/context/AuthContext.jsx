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

  // Safety Timeout: Don't let users stay stuck on 'Entering Accord' for more than 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
        if (loading) {
            console.log("AuthContext: Safety timeout reached, forcing load completion.");
            setLoading(false);
        }
    }, 8000); 
    return () => clearTimeout(timer);
  }, [loading]);

  // Whenever wallet connects/disconnects → sync with Supabase
  useEffect(() => {
    async function syncUser() {
      if (activeAccount === undefined) {
        setLoading(true);
        return;
      }

      const address = activeAccount?.address;
      if (!address) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If it's a social/generated wallet, we enter THE DASHBOARD INSTANTLY
      // We sync the database in the background without making the user wait
      setLoading(false); 

      try {
        const data = await getUserByWallet(address);
        setUser(data);
      } catch (err) {
        console.error("AuthContext: Background sync error:", err);
      }
    }
    syncUser();
  }, [activeAccount]);

  const value = {
    walletAddress: activeAccount?.address || null,
    isConnected: !!activeAccount?.address,
    user,          // full Supabase user row
    loading: loading || (activeAccount === undefined),
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
