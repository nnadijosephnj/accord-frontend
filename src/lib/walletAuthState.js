const PENDING_WALLET_TYPE_KEY = "accord-pending-wallet-type";

export function getPendingWalletType() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PENDING_WALLET_TYPE_KEY);
}

export function setPendingWalletType(walletType) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_WALLET_TYPE_KEY, walletType);
}

export function clearPendingWalletType() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_WALLET_TYPE_KEY);
}
