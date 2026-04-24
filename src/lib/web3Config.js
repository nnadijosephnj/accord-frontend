import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";

const ACCORD_APP_NAME = "Accord";
const DEFAULT_RPC_URL = "https://k8s.testnet.json-rpc.injective.network/";

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
    default: { http: [import.meta.env.VITE_RPC_URL || DEFAULT_RPC_URL] },
    public: { http: [import.meta.env.VITE_RPC_URL || DEFAULT_RPC_URL] },
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

const rpcUrl = import.meta.env.VITE_RPC_URL || DEFAULT_RPC_URL;

const connectors = [
  injected({
    target: "metaMask",
    shimDisconnect: true,
  }),
  coinbaseWallet({
    appName: ACCORD_APP_NAME,
  }),
  // Generic injected connector for Rabby and others
  injected({
    shimDisconnect: true,
  }),
];

export const wagmiConfig = createConfig({
  chains: [injectiveTestnet],
  connectors,
  transports: {
    [injectiveTestnet.id]: http(rpcUrl),
  },
});
