const hre = require("hardhat");

async function main() {
  const stakingContractFactory = await hre.ethers.getContractFactory(
    "PausableStake"
  );
  const stakingContract = await stakingContractFactory.deploy(
    process.env.YIELD_LIMIT,
    process.env.TOKEN_ADDRESS,
    process.env.YIELD_SUPPLIER,
    process.env.BLOCK_TIME,
    process.env.YIELD_PER_DAY,
  );

  console.log("Staking Contract: ", stakingContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
