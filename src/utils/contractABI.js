export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0D56A507C4b740fBB12E24f4c5C88D7944423195";
export const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS || "0xaDC7bcB5d8fe053Ef19b4E0C861c262Af6e0db60";
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS || "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://accord-backend-k0ip.onrender.com";

export const CONTRACT_ABI = [
  "function deposit(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount) external",
  "function getVaultBalance(address user, address token) external view returns (uint256)",
  "function createAgreement(bytes32 id, address freelancer, address token, uint256 amount) external",
  "function createAgreementFromVault(bytes32 id, address freelancer, address token, uint256 amount) external",
  "function deliverWork(bytes32 id, string previewIpfsHash) external",
  "function approveWork(bytes32 id, string cleanIpfsHash) external",
  "function raiseDispute(bytes32 id) external",
  "function resolveDispute(bytes32 id, bool payFreelancer) external",
  "function cancelAgreement(bytes32 id) external",
  "function getAgreement(bytes32 id) external view returns (tuple(bytes32 id, address freelancer, address client, address token, uint256 amount, uint8 status, string previewIpfsHash, string cleanIpfsHash))"
];

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

