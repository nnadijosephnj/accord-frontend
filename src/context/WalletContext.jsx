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
        window.location.href = '/login'; 
    };

    const connectWallet = () => {
        window.location.href = '/login'; 
    };

    return (
        <WalletContext.Provider value={{ 
            address: account?.address?.toLowerCase(), 
            provider, 
            signer, 
            userProfile: user, 
            isLoggedIn: isConnected,
            logout,
            connectWallet,
            isConnecting: false
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
