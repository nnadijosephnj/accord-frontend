import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useActiveAccount } from "thirdweb/react";
import { supabase, upsertUserByEmail, upsertUserByWallet } from "../lib/supabaseHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount(); 
  const [user, setUser] = useState(null);       // The public.users row
  const [session, setSession] = useState(null); // The Supabase session
  // Start loading=true; only set false once we know Thirdweb has resolved
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, step: 'CHOICE' });
  // Track whether Thirdweb has given us a definitive answer (not undefined)
  const thirdwebResolved = useRef(false);

  // 1. Monitor Supabase Session — stable subscription, no dependency on activeAccount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Only clear user if both Supabase session AND wallet are gone
      // Don't touch user here — let the sync effect handle it
    });

    return () => subscription.unsubscribe();
  }, []); // ← stable: no deps, runs once

  // 2. Sync User Profile from DB once we know the wallet state
  useEffect(() => {
    let isMounted = true;

    async function sync() {
      // activeAccount is `undefined` while Thirdweb is still initialising.
      // Once it resolves to `null` (no wallet) or an object (wallet connected)
      // we can proceed. We give it a 3s grace window max.
      if (activeAccount === undefined) {
        if (thirdwebResolved.current) {
          // Already waited before — don't spin forever
          if (isMounted) setLoading(false);
        }
        return;
      }

      // Thirdweb has now resolved
      thirdwebResolved.current = true;

      try {
        let dbUser = null;
        const email = session?.user?.email;
        const walletAddress = activeAccount?.address;

        if (email) {
          dbUser = await upsertUserByEmail({ 
            email, 
            loginMethod: session.app_metadata?.provider || 'email' 
          });
        } else if (walletAddress) {
          dbUser = await upsertUserByWallet({ 
            walletAddress,
            loginMethod: 'wallet'
          });
        } else {
          // Neither email session nor wallet — definitely logged out
          dbUser = null;
        }

        if (isMounted) setUser(dbUser);
      } catch (err) {
        console.error("Auth sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    sync();
    return () => { isMounted = false; };
  }, [session, activeAccount]);

  // 3. Grace period: if Thirdweb never resolves past `undefined` in 4s, unblock the UI
  useEffect(() => {
    const t = setTimeout(() => {
      if (activeAccount === undefined) {
        thirdwebResolved.current = true;
        setLoading(false);
      }
    }, 4000);
    return () => clearTimeout(t);
  }, []); // runs once on mount

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
    window.location.href = "/";
  };

  // Connected = has a Supabase session OR has a live wallet account
  const isConnected = !!session || !!activeAccount?.address;

  const value = {
    user,
    setUser,
    session,
    isAuthenticated: isConnected,
    isConnected,
    isGuest: !!session && !activeAccount?.address,
    loading,
    authModal,
    openAuthModal: (step = 'CHOICE') => setAuthModal({ open: true, step }),
    closeAuthModal: () => setAuthModal({ open: false, step: 'CHOICE' }),
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
