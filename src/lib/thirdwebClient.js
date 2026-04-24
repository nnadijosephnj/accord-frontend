import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const DEFAULT_NETWORK = "testnet";
export const NETWORK_STORAGE_KEY = "accord-network";

export const injectiveTestnet = defineChain(1439);
export const injectiveMainnet = defineChain(1776);

export const NETWORK_CONFIGS = {
  testnet: {
    key: "testnet",
    label: "Injective EVM Testnet Wallet",
    chain: injectiveTestnet,
    chainId: 1439,
    contractAddress:
      import.meta.env.VITE_CONTRACT_ADDRESS_TESTNET ||
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      "",
    usdcAddress:
      import.meta.env.VITE_USDC_ADDRESS_TESTNET ||
      import.meta.env.VITE_USDC_ADDRESS ||
      "",
  },
  mainnet: {
    key: "mainnet",
    label: "Injective Mainnet",
    chain: injectiveMainnet,
    chainId: 1776,
    contractAddress:
      import.meta.env.VITE_CONTRACT_ADDRESS_MAINNET ||
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      "",
    usdcAddress:
      import.meta.env.VITE_USDC_ADDRESS_MAINNET ||
      import.meta.env.VITE_USDC_ADDRESS ||
      "",
  },
};

export function getNetworkConfig(network = DEFAULT_NETWORK) {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[DEFAULT_NETWORK];
}

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});
Choose a wallet path that fits how you want to work.