import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [address, setAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    
    const connectWallet = async () => {
        try {
            setIsConnecting(true);
            let detectedProvider;
            
            if (window.keplr && window.keplr.ethereum) {
                await window.keplr.ethereum.enable();
                detectedProvider = window.keplr.ethereum;
            } else if (window.leap && window.leap.ethereum) {
                await window.leap.ethereum.enable();
                detectedProvider = window.leap.ethereum;
            } else if (window.ethereum) {
                detectedProvider = window.ethereum;
            } else {
                alert("Please install Keplr wallet from keplr.app to continue");
                return;
            }
            
            const ethersProvider = new ethers.BrowserProvider(detectedProvider);
            
            try {
                // Ensure Injective testnet
                await detectedProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x59f' }] // 1439
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
                            blockExplorerUrls: ['https://testnet.blockscout.injective.network/blocks']
                        }]
                    });
                }
            }
            
            const reqAccounts = await ethersProvider.send('eth_requestAccounts', []);
            const ethersSigner = await ethersProvider.getSigner(); // MUST await in v6
            const addr = await ethersSigner.getAddress();
            
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAddress(addr);
            
        } catch (error) {
            console.error("Connection error:", error);
        } finally {
            setIsConnecting(false);
        }
    };
    
    return (
        <WalletContext.Provider value={{ address, provider, signer, connectWallet, isConnecting }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
