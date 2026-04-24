import { getDefaultConfig, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, trustWallet, coinbaseWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";

export const DEFAULT_NETWORK = "testnet";
export const NETWORK_STORAGE_KEY = "accord-network";

export const injectiveTestnet = {
  id: 1439,
  name: "Injective Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "INJ",
    symbol: "INJ",
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/"] },
    public: { http: [import.meta.env.VITE_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://testnet.blockscout.injective.network" },
  },
  testnet: true,
};

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
};

export function getNetworkConfig(network = DEFAULT_NETWORK) {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[DEFAULT_NETWORK];
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet],
    },
    {
      groupName: "Other",
      wallets: [trustWallet, coinbaseWallet, rabbyWallet],
    },
  ],
  {
    appName: "Accord",
    projectId: "ac2026", // any dummy project id is fine
  }
);

export const wagmiConfig = getDefaultConfig({
  appName: "Accord",
  projectId: "ac2026",
  chains: [injectiveTestnet],
  connectors: connectors,
  transports: {
    [injectiveTestnet.id]: http(import.meta.env.VITE_RPC_URL),
  },
});
