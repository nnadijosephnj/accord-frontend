export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xC6Aa87E8869CE8C026725a2a51A5f6D622ccC0B3";
export const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS || "0xaDC7bcB5d8fe053Ef19b4E0C861c262Af6e0db60";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://accord-backend-k0ip.onrender.com";

export const CONTRACT_ABI = [
  "function createAgreement(address _client, uint256 _amount, uint8 _maxRevisions) external returns (uint256)",
  "function depositFunds(uint256 _id) external",
  "function submitWork(uint256 _id) external",
  "function approveWork(uint256 _id) external",
  "function requestRevision(uint256 _id) external",
  "function requestCancel(uint256 _id) external",
  "function executeRefund(uint256 _id) external",
  "function getAgreement(uint256 _id) external view returns (tuple(uint256 id, address freelancer, address client, uint256 amount, uint8 maxRevisions, uint8 revisionCount, uint8 status, uint256 cancelRequestedAt))"
];

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];
