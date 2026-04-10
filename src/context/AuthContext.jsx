// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global auth state. Wrap your entire app with <AuthProvider>.
// Any component can call useAuth() to get user info.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { getUserByWallet, upsertUser } from "../lib/supabaseHelpers";
import { inAppWallet } from "thirdweb/wallets";
import { client } from "../lib/thirdwebClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount(); // Thirdweb hook — works for both external wallets and generated wallets
  const activeWallet = useActiveWallet();
  const [user, setUser] = useState(null);  // Full user record from Supabase
  const [loading, setLoading] = useState(true);

  // Safety Timeout: Don't let users stay stuck on 'Entering Accord' for more than 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
        if (loading) {
            console.log("AuthContext: Safety timeout reached, forcing load completion.");
            setLoading(false);
        }
    }, 15000); 
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
        // Find if this is a social/email login to get the email
        const data = await getUserByWallet(address);
        
        let foundEmail = data?.email;
        // If email is missing in DB, try to get it from Thirdweb profile
        if (!foundEmail && activeWallet) {
          try {
            // New v5 way - get profiles from the active wallet
            const profiles = await activeWallet.getProfiles();
            foundEmail = profiles?.[0]?.details?.email;
            console.log("AuthContext: Found email from profile:", foundEmail);
          } catch (e) { 
            console.log("AuthContext: Could not fetch social profile");
          }
        }

        // Auto-Provision Profile if missing OR if we found a new email
        if (!data || (foundEmail && !data.email)) {
           const isGenerated = activeWallet?.id === "in-app";
           await upsertUser({
             walletAddress: address,
             email: foundEmail,
             loginMethod: data?.login_method || (foundEmail ? (isGenerated ? "google" : "wallet") : "generated"),
             walletType: isGenerated ? "generated" : "external"
           });
           // Refresh user data after upsert
           const updatedData = await getUserByWallet(address);
           setUser(updatedData);
        } else {
           // If data exists, but wallet type is somehow wrong, we update it in the UI state
           setUser(data);
        }
      } catch (err) {
        console.error("AuthContext: Background sync error:", err);
      }
    }
    syncUser();
  }, [activeAccount, activeWallet]);

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
