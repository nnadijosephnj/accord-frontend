import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { upsertUserByWallet } from "../lib/supabaseHelpers";
import { clearWalletApiAuth } from "../lib/walletApiAuth";
import { clearPendingWalletType, getPendingWalletType } from "../lib/walletAuthState";
import { getMagic, getMagicWalletAddress } from "../lib/magicClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const wagmiAccount = useAccount();
  const { disconnect } = useDisconnect();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, step: "CHOICE" });
  
  const [magicAddress, setMagicAddress] = useState(null);
  const [isMagicReady, setIsMagicReady] = useState(false);
  const lastSyncedWalletRef = useRef(null);

  const syncUserRecord = useCallback(async ({ walletAddress, walletType }) => {
    const normalizedWalletAddress = walletAddress?.toLowerCase();
    if (!normalizedWalletAddress) {
      return null;
    }

    const syncKey = `${walletType}:${normalizedWalletAddress}`;
    if (
      lastSyncedWalletRef.current === syncKey &&
      user?.wallet_address === normalizedWalletAddress
    ) {
      return user;
    }

    const dbUser = await upsertUserByWallet({
      walletAddress: normalizedWalletAddress,
      walletType,
    });

    lastSyncedWalletRef.current = syncKey;
    setUser(dbUser);
    return dbUser;
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const checkMagic = async () => {
      try {
        const magic = getMagic();
        if (!magic) {
          if (isMounted) setIsMagicReady(true);
          return;
        }

        let detectedMagicAddress = null;

        try {
          const result = await magic.oauth2.getRedirectResult();
          detectedMagicAddress = getMagicWalletAddress(result?.magic?.userMetadata);
        } catch {
          detectedMagicAddress = null;
        }

        if (!detectedMagicAddress) {
          const isLoggedIn = await magic.user.isLoggedIn();
          if (isLoggedIn) {
            const info = await magic.user.getInfo();
            detectedMagicAddress = getMagicWalletAddress(info);
          }
        }

        if (detectedMagicAddress && isMounted) {
          setMagicAddress(detectedMagicAddress);
        }
      } catch (error) {
        console.warn("Magic session check failed:", error);
      }
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
          lastSyncedWalletRef.current = null;
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const pendingWalletType = getPendingWalletType();
        const computedWalletType = magicAddress ? "generated" : "external";

        const dbUser = await syncUserRecord({
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
  }, [combinedAddress, isCombinedConnected, wagmiAccount.isConnecting, wagmiAccount.isReconnecting, isMagicReady, magicAddress, syncUserRecord]);

  const completeMagicLogin = async () => {
    const magic = getMagic();
    if (!magic) {
      throw new Error("Magic is not configured for this environment.");
    }

    const userInfo = await magic.user.getInfo();
    const nextMagicAddress = getMagicWalletAddress(userInfo);

    if (!nextMagicAddress) {
      throw new Error("Magic did not return a wallet address.");
    }

    setMagicAddress(nextMagicAddress);
    setIsMagicReady(true);

    const dbUser = await syncUserRecord({
      walletAddress: nextMagicAddress,
      walletType: "generated",
    });

    clearPendingWalletType();
    setLoading(false);
    return dbUser;
  };

  const logout = async () => {
    clearPendingWalletType();
    clearWalletApiAuth();
    lastSyncedWalletRef.current = null;
    setMagicAddress(null);
    setUser(null);
    setLoading(true);
    
    try {
      if (wagmiAccount.connector) disconnect({ connector: wagmiAccount.connector });
    } catch (error) {
      console.warn("Wallet disconnect cleanup failed:", error);
    }
    
    try {
      const magic = getMagic();
      if (magic) await magic.user.logout();
    } catch (error) {
      console.warn("Magic logout cleanup failed:", error);
    }
    
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
    completeMagicLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
