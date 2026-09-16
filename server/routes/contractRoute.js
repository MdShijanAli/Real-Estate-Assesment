const express = require("express");
const {
  getHealth,
  getTotalSupply,
  getPropertyToken,
  mintProperty,
  getEscrowStatus,
  getEscrowBalance,
  prepareEscrowTransaction,
} = require("../controllers/contractController");
const {
  validateMint,
  validateNftIdParam,
  validateEscrowTransaction,
} = require("../middlewares/validator/contractValidator");

const router = express.Router();

router.route("/health").get(getHealth);

// Static/collection routes must be declared before the ":tokenId" /
// ":nftId" wildcard routes below, otherwise Express would try to match
// e.g. "total-supply" or "balance" as an id.
router.route("/real-estate/total-supply").get(getTotalSupply);
router.route("/real-estate/mint").post(validateMint, mintProperty);
router.route("/real-estate/:tokenId").get(getPropertyToken);

router.route("/escrow/balance").get(getEscrowBalance);
router.route("/escrow/transactions").post(validateEscrowTransaction, prepareEscrowTransaction);
router.route("/escrow/:nftId").get(validateNftIdParam, getEscrowStatus);

module.exports = router;
