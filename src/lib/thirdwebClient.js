// src/lib/thirdwebClient.js
// ─────────────────────────────────────────────────────────────
// Single Thirdweb client instance used across the entire app
// ─────────────────────────────────────────────────────────────

import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Injective EVM Testnet chain definition
export const injectiveTestnet = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpc: "https://testnet.rpc.inevm.com/http",
});

// USDC — the only currency Accord uses
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
export const USDC_DECIMALS = 6;

// Accord V2 smart contract address
export const ACCORD_CONTRACT_ADDRESS = import.meta.env.VITE_ACCORD_CONTRACT_ADDRESS;

// Thirdweb client — one instance for the whole app
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});
