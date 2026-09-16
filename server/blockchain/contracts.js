const { ethers } = require("ethers");
const { getProvider, getSigner } = require("./provider");
const RealEstateABI = require("./abis/RealEstate.json");
const EscrowABI = require("./abis/Escrow.json");

exports.getRealEstateContract = (withSigner = false) => {
  const address = process.env.REAL_ESTATE_CONTRACT_ADDRESS;
  if (!address) throw new Error("REAL_ESTATE_CONTRACT_ADDRESS is not configured");
  return new ethers.Contract(address, RealEstateABI, withSigner ? getSigner() : getProvider());
};

exports.getEscrowContract = (withSigner = false) => {
  const address = process.env.ESCROW_CONTRACT_ADDRESS;
  if (!address) throw new Error("ESCROW_CONTRACT_ADDRESS is not configured");
  return new ethers.Contract(address, EscrowABI, withSigner ? getSigner() : getProvider());
};
