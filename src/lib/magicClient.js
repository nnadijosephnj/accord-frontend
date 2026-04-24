import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";

let magicInstance = null;

export const getMagic = () => {
  if (typeof window === "undefined") {
    return null;
  }
  
  if (!magicInstance) {
    magicInstance = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY || "dummy", {
      extensions: [new OAuthExtension()],
      network: {
        rpcUrl: import.meta.env.VITE_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/",
        chainId: 1439,
      },
    });
  }

  return magicInstance;
};
