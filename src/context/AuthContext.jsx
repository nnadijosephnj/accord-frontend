import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { upsertUserByWallet } from "../lib/supabaseHelpers";
import { clearWalletApiAuth } from "../lib/walletApiAuth";
import { clearPendingWalletType, getPendingWalletType } from "../lib/walletAuthState";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const activeAccount = useActiveAccount();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, step: "CHOICE" });
  const thirdwebResolved = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function sync() {
      if (activeAccount === undefined) {
        if (thirdwebResolved.current && isMounted) {
          setLoading(false);
        }
        return;
      }

      thirdwebResolved.current = true;

      try {
        const walletAddress = activeAccount?.address;

        if (walletAddress) {
          const pendingWalletType = getPendingWalletType();
          const dbUser = await upsertUserByWallet({
            walletAddress,
            walletType: pendingWalletType || activeAccount._walletType || "external",
          });

          if (pendingWalletType) {
            clearPendingWalletType();
          }

          if (isMounted) {
            setUser(dbUser);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    sync();
    return () => {
      isMounted = false;
    };
  }, [activeAccount]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeAccount === undefined) {
        thirdwebResolved.current = true;
        setLoading(false);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [activeAccount]);

  const logout = async () => {
    clearPendingWalletType();
    clearWalletApiAuth();
    setUser(null);
    setLoading(false);
    window.location.href = "/";
  };

  const isConnected = !!activeAccount?.address;

  const value = {
    user,
    setUser,
    isAuthenticated: isConnected,
    isConnected,
    loading,
    walletAddress: activeAccount?.address?.toLowerCase() || null,
    authModal,
    openAuthModal: (step = "CHOICE") => setAuthModal({ open: true, step }),
    closeAuthModal: () => setAuthModal({ open: false, step: "CHOICE" }),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
