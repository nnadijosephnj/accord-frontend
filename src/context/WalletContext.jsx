import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useActiveAccount } from "thirdweb/react";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { client } from "../lib/thirdwebClient";
import { defineChain } from "thirdweb/chains";

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const { user, isConnected } = useAuth();
    const account = useActiveAccount();
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    useEffect(() => {
        if (account) {
            ethers6Adapter.signer.toEthers({
                client,
                chain: defineChain(1439),
                account
            }).then(setSigner).catch(console.error);
        } else {
            setSigner(null);
        }
    }, [account]);

    const logout = () => {
        // Since we are using Thirdweb, the "ActiveAccount" will clear 
        // when the user disconnects via the Thirdweb hooks.
        // We'll just reset local state if needed.
        setSigner(null);
    };

    const connectWallet = () => {
        // No longer redirecting. The UI (Landing) will now handle 
        // showing the custom login modal.
    };

    return (
        <WalletContext.Provider value={{ 
            address: account?.address?.toLowerCase() || null, 
            provider, 
            signer, 
            userProfile: user, 
            isLoggedIn: isConnected,
            logout,
            connectWallet,
            isConnecting: !isConnected && !!account // simple loading state
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
