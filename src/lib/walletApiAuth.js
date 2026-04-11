const WALLET_API_AUTH_KEY = "accord-wallet-api-proof";
const WALLET_API_AUTH_TTL_MS = 24 * 60 * 60 * 1000;

let activeWalletAddress = null;
let signMessageFn = null;
let pendingProofPromise = null;

export function buildWalletAuthMessage({ walletAddress, issuedAt }) {
  const normalizedWalletAddress = walletAddress?.toLowerCase();

  return [
    "Accord Wallet Authorization",
    "",
    `Wallet: ${normalizedWalletAddress}`,
    `Issued At: ${issuedAt}`,
    "Purpose: Authorize this browser session to access the Accord backend.",
  ].join("\n");
}

function readStoredProof() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(WALLET_API_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to read stored wallet auth proof:", error);
    return null;
  }
}

function writeStoredProof(proof) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(WALLET_API_AUTH_KEY, JSON.stringify(proof));
}

function clearStoredProof() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(WALLET_API_AUTH_KEY);
}

function isProofFresh(proof, walletAddress) {
  if (!proof?.walletAddress || !proof?.issuedAt || !proof?.signature) return false;
  if (proof.walletAddress !== walletAddress) return false;

  const ageMs = Date.now() - Number(proof.issuedAt);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= WALLET_API_AUTH_TTL_MS;
}

async function ensureWalletAuthProof() {
  if (!activeWalletAddress || typeof signMessageFn !== "function") {
    throw new Error("Connect a wallet to continue.");
  }

  const storedProof = readStoredProof();
  if (isProofFresh(storedProof, activeWalletAddress)) {
    return storedProof;
  }

  if (!pendingProofPromise) {
    pendingProofPromise = (async () => {
      const issuedAt = Date.now().toString();
      const message = buildWalletAuthMessage({
        walletAddress: activeWalletAddress,
        issuedAt,
      });

      const signature = await signMessageFn(message);
      const proof = {
        walletAddress: activeWalletAddress,
        issuedAt,
        signature,
      };

      writeStoredProof(proof);
      return proof;
    })().finally(() => {
      pendingProofPromise = null;
    });
  }

  return pendingProofPromise;
}

export function configureWalletApiAuth({ walletAddress, signMessage }) {
  const normalizedWalletAddress = walletAddress?.toLowerCase() || null;

  if (!normalizedWalletAddress || typeof signMessage !== "function") {
    clearWalletApiAuth();
    return;
  }

  if (activeWalletAddress && activeWalletAddress !== normalizedWalletAddress) {
    clearStoredProof();
  }

  activeWalletAddress = normalizedWalletAddress;
  signMessageFn = signMessage;
}

export function clearWalletApiAuth() {
  activeWalletAddress = null;
  signMessageFn = null;
  pendingProofPromise = null;
  clearStoredProof();
}

export async function getWalletAuthHeaders() {
  const proof = await ensureWalletAuthProof();

  return {
    "x-wallet-address": proof.walletAddress,
    "x-wallet-issued-at": proof.issuedAt,
    "x-wallet-signature": proof.signature,
  };
}
