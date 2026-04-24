import React, { createContext, useContext, useEffect, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import IntegratedAuthModal from "../components/IntegratedAuthModal";
import { useAuth } from "./AuthContext";
import { clearWalletApiAuth, configureWalletApiAuth } from "../lib/walletApiAuth";
import { useNetwork } from "./NetworkContext";
import { getMagic } from "../lib/magicClient";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const navigate = useNavigate();
  const { user, isConnected, authModal, closeAuthModal, openAuthModal, logout: authLogout, walletAddress, isMagic } = useAuth();
  const { currentChain, network } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const generateSigner = async () => {
      if (!isConnected || !walletAddress) {
        if (isMounted) setSigner(null);
        return;
      }

      if (isMagic) {
        try {
          const magic = getMagic();
          if (magic?.rpcProvider) {
            const provider = new BrowserProvider(magic.rpcProvider);
            const ethersSigner = await provider.getSigner();
            if (isMounted) setSigner(ethersSigner);
          }
        } catch(e) {
          console.error("Failed to convert Magic to signer:", e);
        }
      } else {
        if (walletClient) {
          try {
            const networkDef = {
              chainId: walletClient.chain.id,
              name: walletClient.chain.name,
              ensAddress: walletClient.chain.contracts?.ensRegistry?.address,
            };
            const provider = new BrowserProvider(walletClient.transport, networkDef);
            const ethersSigner = new JsonRpcSigner(provider, walletClient.account.address);
            if (isMounted) setSigner(ethersSigner);
          } catch(e) {
            console.error("Failed to convert Wagmi to signer:", e);
          }
        } else {
          if (isMounted) setSigner(null);
        }
      }
    };
    generateSigner();
    return () => { isMounted = false; };
  }, [isConnected, walletAddress, isMagic, walletClient]);

  useLayoutEffect(() => {
    if (!walletAddress || !signer) {
      clearWalletApiAuth();
      return;
    }

    configureWalletApiAuth({
      walletAddress: walletAddress,
      signMessage: async (message) => await signer.signMessage(message),
    });
  }, [walletAddress, signer]);

  const logout = async () => {
    authLogout(); 
  };

  const connectWallet = (preferredStep = "CHOICE") => {
    openAuthModal(preferredStep);
  };

  return (
    <WalletContext.Provider
      value={{
        address: walletAddress,
        provider: null,
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
