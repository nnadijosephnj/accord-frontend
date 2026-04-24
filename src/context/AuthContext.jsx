import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { upsertUserByWallet } from "../lib/supabaseHelpers";
import { clearWalletApiAuth } from "../lib/walletApiAuth";
import { clearPendingWalletType, getPendingWalletType } from "../lib/walletAuthState";
import { getMagic } from "../lib/magicClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const wagmiAccount = useAccount();
  const { disconnect } = useDisconnect();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, step: "CHOICE" });
  
  const [magicAddress, setMagicAddress] = useState(null);
  const [isMagicReady, setIsMagicReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkMagic = async () => {
      try {
        const magic = getMagic();
        if (!magic) {
          if (isMounted) setIsMagicReady(true);
          return;
        }

        // Check if OAuth redirect happened
        try {
          const result = await magic.oauth2.getRedirectResult();
          if (result && result.magic && result.magic.userMetadata) {
            if (isMounted) setMagicAddress(result.magic.userMetadata.publicAddress);
          }
        } catch(e) {
            // Ignore if no redirect result
        }
        
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          const info = await magic.user.getInfo();
          if (isMounted) setMagicAddress(info.publicAddress);
        }
      } catch(e) {}
      if (isMounted) setIsMagicReady(true);
    };
    checkMagic();
    return () => { isMounted = false; };
  }, []);

  const combinedAddress = magicAddress || wagmiAccount.address;
  const isCombinedConnected = !!combinedAddress;

  useEffect(() => {
    let isMounted = true;

    async function sync() {
      // Wagmi can be resolving its initial state.
      if (!isMagicReady || wagmiAccount.isConnecting || wagmiAccount.isReconnecting) {
        return;
      }

      if (!isCombinedConnected) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const pendingWalletType = getPendingWalletType();
        const computedWalletType = magicAddress ? "generated" : "external";
        
        const dbUser = await upsertUserByWallet({
          walletAddress: combinedAddress,
          walletType: computedWalletType,
        });

        if (pendingWalletType) {
          clearPendingWalletType();
        }

        if (isMounted) {
          setUser(dbUser);
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
    return () => { isMounted = false; };
  }, [combinedAddress, isCombinedConnected, wagmiAccount.isConnecting, wagmiAccount.isReconnecting, isMagicReady, magicAddress]);

  const logout = async () => {
    clearPendingWalletType();
    clearWalletApiAuth();
    setUser(null);
    setLoading(true);
    
    try {
      if (wagmiAccount.connector) disconnect({ connector: wagmiAccount.connector });
    } catch(e) {}
    
    try {
      const magic = getMagic();
      if (magic) await magic.user.logout();
    } catch(e) {}
    
    window.location.href = "/";
  };

  const value = {
    user,
    setUser,
    isAuthenticated: isCombinedConnected && !!user,
    isConnected: isCombinedConnected,
    loading,
    walletAddress: combinedAddress?.toLowerCase() || null,
    isMagic: !!magicAddress,
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
