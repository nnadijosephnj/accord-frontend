import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { apiCall } from '../utils/api';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [address, setAddress] = useState(localStorage.getItem('wallet_address'));
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    
    // Automatically try to reconnect if there's a stored address
    useEffect(() => {
        if (address && !provider) {
            connectWallet(true); // silent/background connect
        }
    }, []);

    const connectWallet = async (isReconnect = false) => {
        try {
            if (!isReconnect) setIsConnecting(true);
            let detectedProvider;
            
            if (window.keplr && window.keplr.ethereum) {
                detectedProvider = window.keplr.ethereum;
            } else if (window.leap && window.leap.ethereum) {
                detectedProvider = window.leap.ethereum;
            } else if (window.ethereum) {
                detectedProvider = window.ethereum;
            } else if (!isReconnect) {
                alert("Please install Keplr wallet from keplr.app to continue");
                return;
            } else {
                return; // Silently fail on reconnect
            }
            
            const ethersProvider = new ethers.BrowserProvider(detectedProvider);
            
            // Switch to Injective Testnet
            try {
                await detectedProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x59f' }]
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await detectedProvider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x59f',
                            chainName: 'Injective EVM Testnet',
                            rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
                            nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
                            blockExplorerUrls: ['https://testnet.blockscout.injective.network/']
                        }]
                    });
                }
            }
            
            await ethersProvider.send('eth_requestAccounts', []);
            const ethersSigner = await ethersProvider.getSigner();
            const addr = await ethersSigner.getAddress();
            
            // Perform login signature if we don't have a token or it's a new connection
            if (!localStorage.getItem('jwt_token') || localStorage.getItem('wallet_address') !== addr.toLowerCase()) {
                const message = `Welcome to Accord! Sign this message to log in securely.\n\nWallet: ${addr.toLowerCase()}\nTimestamp: ${Date.now()}`;
                const signature = await ethersSigner.signMessage(message);
                
                const { token } = await apiCall('/api/auth/verify', {
                    method: 'POST',
                    body: JSON.stringify({ address: addr, signature, message })
                });
                
                localStorage.setItem('jwt_token', token);
            }
            
            localStorage.setItem('wallet_address', addr.toLowerCase());
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAddress(addr.toLowerCase());
            
        } catch (error) {
            console.error("Connection error:", error);
            if (!isReconnect) alert("Failed to connect wallet: " + error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('jwt_token');
        setAddress(null);
        setProvider(null);
        setSigner(null);
    };
    
    return (
        <WalletContext.Provider value={{ address, provider, signer, connectWallet, logout, isConnecting }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
