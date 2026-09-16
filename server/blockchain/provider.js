const { ethers } = require("ethers");

let provider;
let signer;

// Lazily create a single shared JSON-RPC provider for the configured chain
// (local Hardhat node, testnet, or mainnet - whatever RPC_URL points to).
exports.getProvider = () => {
  if (!provider) {
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL is not configured");
    }
    provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }
  return provider;
};

// Signer used for operations the platform itself is authorized to perform
// (e.g. minting property NFTs). User-specific actions (buyer/seller/inspector)
// must be signed client-side - see contractService.prepareEscrowTransaction.
exports.getSigner = () => {
  if (!signer) {
    if (!process.env.SIGNER_PRIVATE_KEY) {
      throw new Error("SIGNER_PRIVATE_KEY is not configured");
    }
    signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, exports.getProvider());
  }
  return signer;
};
