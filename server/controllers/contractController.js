const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const contractService = require("../services/contractService");

exports.getHealth = asyncErrorHandler(async (req, res) => {
  const network = await contractService.getNetworkStatus();
  res.status(200).json({ success: true, network });
});

exports.getTotalSupply = asyncErrorHandler(async (req, res) => {
  const totalSupply = await contractService.getTotalSupply();
  res.status(200).json({ success: true, totalSupply });
});

exports.getPropertyToken = asyncErrorHandler(async (req, res) => {
  const token = await contractService.getPropertyToken(req.params.tokenId);
  res.status(200).json({ success: true, token });
});

exports.mintProperty = asyncErrorHandler(async (req, res) => {
  const result = await contractService.mintProperty(req.body.tokenURI);
  res.status(201).json({ success: true, ...result });
});

exports.getEscrowStatus = asyncErrorHandler(async (req, res) => {
  const escrow = await contractService.getEscrowStatus(req.params.nftId);
  res.status(200).json({ success: true, escrow });
});

exports.getEscrowBalance = asyncErrorHandler(async (req, res) => {
  const balanceEth = await contractService.getEscrowBalance();
  res.status(200).json({ success: true, balanceEth });
});

exports.prepareEscrowTransaction = asyncErrorHandler(async (req, res) => {
  const { action, params, value } = req.body;
  const transaction = await contractService.prepareEscrowTransaction(action, params, value);
  res.status(200).json({ success: true, transaction });
});
