const { ethers } = require("ethers");
const ErrorHandler = require("../../utils/errorHandler");
const { ESCROW_ACTIONS } = require("../../services/contractService");

exports.validateMint = (req, res, next) => {
  const { tokenURI } = req.body;
  if (!tokenURI || typeof tokenURI !== "string") {
    return next(new ErrorHandler("tokenURI (string) is required", 400));
  }
  next();
};

exports.validateNftIdParam = (req, res, next) => {
  const { nftId } = req.params;
  if (nftId === undefined || Number.isNaN(Number(nftId)) || Number(nftId) < 0) {
    return next(new ErrorHandler("A valid, non-negative nftId is required", 400));
  }
  next();
};

exports.validateEscrowTransaction = (req, res, next) => {
  const { action, params } = req.body;

  if (!ESCROW_ACTIONS.includes(action)) {
    return next(
      new ErrorHandler(`action must be one of: ${ESCROW_ACTIONS.join(", ")}`, 400)
    );
  }

  if (!params || params.nftId === undefined) {
    return next(new ErrorHandler("params.nftId is required", 400));
  }

  if (params.buyer !== undefined && !ethers.utils.isAddress(params.buyer)) {
    return next(new ErrorHandler("params.buyer must be a valid address", 400));
  }

  next();
};
