// Local development deploy script.
// Usage: npx hardhat run scripts/deploy.js --network localhost
// (with `npx hardhat node` running in another terminal)
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer, seller, inspector, lender] = await hre.ethers.getSigners();

  const RealEstate = await hre.ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );
  await escrow.deployed();

  const summary = {
    deployer: deployer.address,
    seller: seller.address,
    inspector: inspector.address,
    lender: lender.address,
    REAL_ESTATE_CONTRACT_ADDRESS: realEstate.address,
    ESCROW_CONTRACT_ADDRESS: escrow.address,
  };

  console.log(JSON.stringify(summary, null, 2));
  fs.writeFileSync(
    path.join(__dirname, "..", "deployment.local.json"),
    JSON.stringify(summary, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
