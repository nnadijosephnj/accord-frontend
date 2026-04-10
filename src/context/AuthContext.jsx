// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global auth state. Wrap your entire app with <AuthProvider>.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { supabase, getUserByEmail, upsertUserByEmail, getUserByWallet, upsertUserByWallet } from "../lib/supabaseHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount(); 
  const activeWallet = useActiveWallet();
  const [user, setUser] = useState(null);       // Full user record from Supabase public.users
  const [session, setSession] = useState(null); // Supabase Auth session
  const [loading, setLoading] = useState(true);

  // 1. Listen for Supabase Auth changes (Google OAuth / Email OTP)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Sync public.users based on either Supabase Session (Email) or Active Wallet
  useEffect(() => {
    async function syncUser() {
      // If we're still waiting for Thirdweb to initialize its state
      if (activeAccount === undefined) {
        setLoading(true);
        return;
      }

      const email = session?.user?.email;
      const walletAddress = activeAccount?.address;

      try {
        let dbUser = null;

        if (email) {
          // Path: Logged in via Google/Email (Supabase Auth)
          dbUser = await upsertUserByEmail({ 
            email, 
            loginMethod: session.app_metadata.provider || 'email' 
          });
          
          // If they also have an active wallet, and it's not linked yet, we might need to link it
          // But according to the user's flow, linking happens in the WalletPrompt/Settings.
          // For now, if both exist, prioritize the DB record linked to the email.
        } else if (walletAddress) {
          // Path: Logged in via direct wallet connection (No email yet)
          dbUser = await upsertUserByWallet({ 
            walletAddress, 
            walletType: activeWallet?.id === 'in-app' ? 'generated' : 'external',
            loginMethod: 'wallet'
          });
        }

        setUser(dbUser);
      } catch (err) {
        console.error("AuthContext: Sync error:", err);
      } finally {
        setLoading(false);
      }
    }
    syncUser();
  }, [session, activeAccount, activeWallet]);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Thirdweb disconnect is usually handled by the component calling it or WalletContext
    setUser(null);
    setSession(null);
    setLoading(false);
    window.location.href = "/";
  };

  const value = {
    user,             // full Supabase user row (contains id, email, wallet_address, etc.)
    session,          // Supabase Auth session
    walletAddress: activeAccount?.address || null,
    isConnected: !!activeAccount?.address,
    isGuest: !!session && !activeAccount?.address, // Logged in with email but no wallet
    loading: loading,
    setUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
