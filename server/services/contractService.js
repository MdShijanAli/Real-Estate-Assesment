const { ethers } = require("ethers");
const { getProvider } = require("../blockchain/provider");
const { getRealEstateContract, getEscrowContract } = require("../blockchain/contracts");
const ErrorHandler = require("../utils/errorHandler");

// --- Network -----------------------------------------------------------

exports.getNetworkStatus = async () => {
  const provider = getProvider();
  const [network, blockNumber] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
  ]);
  return { chainId: network.chainId, name: network.name, blockNumber };
};

// --- RealEstate (ERC721) -------------------------------------------------

exports.getTotalSupply = async () => {
  const contract = getRealEstateContract();
  const total = await contract.totalSupply();
  return total.toString();
};

exports.getPropertyToken = async (tokenId) => {
  const contract = getRealEstateContract();
  try {
    const [owner, tokenURI] = await Promise.all([
      contract.ownerOf(tokenId),
      contract.tokenURI(tokenId),
    ]);
    return { tokenId, owner, tokenURI };
  } catch (err) {
    throw new ErrorHandler(`Token ${tokenId} does not exist`, 404);
  }
};

// Server-signed: minting is a platform-authorized action, so the backend's
// own wallet is an acceptable signer here (unlike buyer/seller/inspector
// actions on Escrow below, which must be signed by the actual party).
exports.mintProperty = async (tokenURI) => {
  const contract = getRealEstateContract(true);
  const tx = await contract.mint(tokenURI);
  const receipt = await tx.wait();

  const transferEvent = receipt.events?.find((event) => event.event === "Transfer");
  const tokenId = transferEvent?.args?.tokenId?.toString();

  return { tokenId, transactionHash: receipt.transactionHash };
};

// --- Escrow ---------------------------------------------------------------

exports.getEscrowStatus = async (nftId) => {
  const contract = getEscrowContract();
  const [isListed, purchasePrice, escrowAmount, buyer, inspectionPassed, seller, inspector, lender] =
    await Promise.all([
      contract.isListed(nftId),
      contract.purchasePrice(nftId),
      contract.escrowAmount(nftId),
      contract.buyer(nftId),
      contract.inspectionPassed(nftId),
      contract.seller(),
      contract.inspector(),
      contract.lender(),
    ]);

  return {
    nftId,
    isListed,
    purchasePrice: purchasePrice.toString(),
    escrowAmount: escrowAmount.toString(),
    buyer,
    inspectionPassed,
    seller,
    inspector,
    lender,
  };
};

exports.getEscrowBalance = async () => {
  const contract = getEscrowContract();
  const balance = await contract.getBalance();
  return ethers.utils.formatEther(balance);
};

// Each Escrow action is restricted on-chain to a specific role (buyer, seller,
// inspector, lender). The backend cannot know which of the platform's users
// holds that role's private key, and must never ask for or hold it. Instead
// of executing the transaction itself, it populates the calldata and hands
// back an unsigned transaction that the caller's own connected wallet
// (MetaMask, via the frontend's WalletContext) signs and broadcasts.
const ESCROW_ACTION_BUILDERS = {
  list: ({ nftId, buyer, purchasePrice, escrowAmount }) => ({
    fn: "list",
    args: [nftId, buyer, purchasePrice, escrowAmount],
  }),
  depositEarnest: ({ nftId }) => ({ fn: "depositEarnest", args: [nftId] }),
  updateInspectionStatus: ({ nftId, passed }) => ({
    fn: "updateInspectionStatus",
    args: [nftId, Boolean(passed)],
  }),
  approveSale: ({ nftId }) => ({ fn: "approveSale", args: [nftId] }),
  finalizeSale: ({ nftId }) => ({ fn: "finalizeSale", args: [nftId] }),
  cancelSale: ({ nftId }) => ({ fn: "cancelSale", args: [nftId] }),
};

exports.ESCROW_ACTIONS = Object.keys(ESCROW_ACTION_BUILDERS);

exports.prepareEscrowTransaction = async (action, params = {}, valueInEth) => {
  const build = ESCROW_ACTION_BUILDERS[action];
  if (!build) {
    throw new ErrorHandler(`Unsupported escrow action: ${action}`, 400);
  }

  const { fn, args } = build(params);
  const contract = getEscrowContract();
  const overrides = valueInEth ? { value: ethers.utils.parseEther(String(valueInEth)) } : {};

  const unsignedTx = await contract.populateTransaction[fn](...args, overrides);

  return {
    to: unsignedTx.to,
    data: unsignedTx.data,
    value: unsignedTx.value ? unsignedTx.value.toString() : "0",
  };
};
