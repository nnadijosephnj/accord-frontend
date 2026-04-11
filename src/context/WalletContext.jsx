import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { client } from "../lib/thirdwebClient";
import { defineChain } from "thirdweb/chains";
import { supabase } from "../lib/supabaseHelpers";
import IntegratedAuthModal from "../components/IntegratedAuthModal";

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const { user, isConnected, authModal, closeAuthModal, openAuthModal } = useAuth();
    const activeAccount = useActiveAccount();
    const activeWallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    useEffect(() => {
        if (activeAccount) {
            const syncSigner = async () => {
                try {
                    const s = await ethers6Adapter.signer.toEthers({
                        client,
                        chain: defineChain(1439),
                        account: activeAccount
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
    }, [activeAccount]);

    const logout = async () => {
        try {
            if (activeWallet) {
                await disconnect(activeWallet);
            }
            await supabase.auth.signOut();
            setSigner(null);
            // Re-nav done in window.location.href or handled by AuthContext but we'll do both
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
            window.location.href = "/";
        }
    };

    const connectWallet = (preferredStep = 'CHOICE') => {
        openAuthModal(preferredStep);
    };

    return (
        <WalletContext.Provider value={{ 
            address: activeAccount?.address?.toLowerCase() || null, 
            provider, 
            signer, 
            userProfile: user, 
            isLoggedIn: isConnected,
            logout,
            connectWallet,
            openAuthModal,
            isConnecting: !isConnected && !!activeAccount // simple loading state
        }}>
            {children}
            {authModal.open && (
                <IntegratedAuthModal 
                    isOpen={authModal.open}
                    onClose={closeAuthModal}
                    onComplete={() => {
                        closeAuthModal();
                        window.location.reload();
                    }}
                    forceStep={authModal.step}
                />
            )}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
