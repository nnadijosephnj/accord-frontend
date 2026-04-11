import { createContext, useContext, useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { supabase, upsertUserByEmail, upsertUserByWallet } from "../lib/supabaseHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount(); 
  const [user, setUser] = useState(null);       // The public.users row
  const [session, setSession] = useState(null); // The Supabase session
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, step: 'CHOICE' });

  // 1. Monitor Supabase Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !activeAccount) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [activeAccount]);

  // 2. Sync User Profile from DB
  useEffect(() => {
    let isMounted = true;
    
    async function sync() {
      // Don't finish loading until Thirdweb is at least null
      if (activeAccount === undefined) {
        const timeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 5000);
        return () => clearTimeout(timeout);
      }

      try {
        let dbUser = null;
        const email = session?.user?.email;
        const walletAddress = activeAccount?.address;

        if (email) {
          // Logged in via Google/Email
          dbUser = await upsertUserByEmail({ 
            email, 
            loginMethod: session.app_metadata.provider || 'email' 
          });
        } else if (walletAddress) {
          // Logged in via direct wallet
          dbUser = await upsertUserByWallet({ 
            walletAddress,
            loginMethod: 'wallet'
          });
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

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Wallet disconnect handled in WalletContext
    setUser(null);
    setSession(null);
    setLoading(false);
    window.location.href = "/";
  };

  const value = {
    user,
    session,
    isAuthenticated: !!session || !!activeAccount?.address,
    isGuest: !!session && !activeAccount?.address, // Logged in with email but no wallet yet
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
