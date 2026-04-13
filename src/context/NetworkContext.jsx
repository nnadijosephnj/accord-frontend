import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  DEFAULT_NETWORK,
  getNetworkConfig,
  NETWORK_STORAGE_KEY,
} from "../lib/thirdwebClient";

const NetworkContext = createContext(null);

function normalizeNetwork(value) {
  return value === "mainnet" ? "mainnet" : DEFAULT_NETWORK;
}

function readStoredNetwork() {
  if (typeof window === "undefined") {
    return DEFAULT_NETWORK;
  }

  return normalizeNetwork(window.localStorage.getItem(NETWORK_STORAGE_KEY));
}

export function NetworkProvider({ children }) {
  const { user } = useAuth();
  const [network, setNetworkState] = useState(() => readStoredNetwork());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedNetwork = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    if (!storedNetwork && user?.network) {
      setNetworkState(normalizeNetwork(user.network));
    }
  }, [user?.network]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(NETWORK_STORAGE_KEY, network);
  }, [network]);

  const setNetwork = (nextNetwork) => {
    setNetworkState(normalizeNetwork(nextNetwork));
  };

  const currentConfig = getNetworkConfig(network);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
        toggleNetwork: () =>
          setNetworkState((current) => (current === "testnet" ? "mainnet" : "testnet")),
        currentConfig,
        currentChain: currentConfig.chain,
        isTestnet: network === "testnet",
        isMainnet: network === "mainnet",
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetwork must be used inside NetworkProvider");
  }

  return context;
}
