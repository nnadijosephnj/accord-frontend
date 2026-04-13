import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import IntegratedAuthModal from "../components/IntegratedAuthModal";
import { useAuth } from "./AuthContext";
import { client } from "../lib/thirdwebClient";
import { clearWalletApiAuth, configureWalletApiAuth } from "../lib/walletApiAuth";
import { useNetwork } from "./NetworkContext";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const navigate = useNavigate();
  const { user, isConnected, authModal, closeAuthModal, openAuthModal } = useAuth();
  const { currentChain, network } = useNetwork();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const [signer, setSigner] = useState(null);
  const provider = activeWallet ?? null;

  useEffect(() => {
    if (!activeAccount) {
      setSigner(null);
      return;
    }

    let isMounted = true;

    const syncSigner = async () => {
      try {
        const nextSigner = await ethers6Adapter.signer.toEthers({
          client,
          chain: currentChain,
          account: activeAccount,
        });

        if (isMounted) {
          setSigner(nextSigner);
        }
      } catch (err) {
        console.error("Error converting to Ethers signer:", err);
      }
    };

    syncSigner();
    return () => {
      isMounted = false;
    };
  }, [activeAccount, currentChain]);

  useLayoutEffect(() => {
    if (!activeAccount?.address || typeof activeAccount.signMessage !== "function") {
      clearWalletApiAuth();
      return;
    }

    configureWalletApiAuth({
      walletAddress: activeAccount.address,
      signMessage: async (message) => activeAccount.signMessage({ message }),
    });
  }, [activeAccount]);

  const logout = async () => {
    try {
      if (activeWallet) {
        await disconnect(activeWallet);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      clearWalletApiAuth();
      setSigner(null);
      window.location.href = "/";
    }
  };

  const connectWallet = (preferredStep = "CHOICE") => {
    openAuthModal(preferredStep);
  };

  return (
    <WalletContext.Provider
      value={{
        address: activeAccount?.address?.toLowerCase() || null,
        provider,
        signer,
        userProfile: user,
        isLoggedIn: isConnected,
        network,
        currentChain,
        logout,
        connectWallet,
        openAuthModal,
        isConnecting: authModal.open,
      }}
    >
      {children}
      {authModal.open && (
        <IntegratedAuthModal
          isOpen={authModal.open}
          onClose={closeAuthModal}
          onComplete={() => {
            closeAuthModal();
            navigate("/dashboard/overview");
          }}
        />
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
