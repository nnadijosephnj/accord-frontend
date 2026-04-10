import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useActiveAccount, useDisconnect } from "thirdweb/react";
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
            const syncSigner = async () => {
                try {
                    const s = await ethers6Adapter.signer.toEthers({
                        client,
                        chain: defineChain(1439),
                        account
                    });
                    setSigner(s);
                } catch (err) {
                    console.error("Error converting to Ethers signer:", err);
                }
            };
            syncSigner();
        } else {
            setSigner(null);
        }
    }, [account]);

    const { disconnect } = useDisconnect();

    const logout = () => {
        if (account) {
            disconnect(account);
        }
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
