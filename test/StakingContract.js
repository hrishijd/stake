const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Contract", function () {
  let stakingContract, testToken, owner, invester1, invester2, supplyAmountInvester, yieldLimit ,yieldSupplier;

  async function stake(invester, amount) {
    await testToken.connect(invester).approve(stakingContract.getAddress(), amount);
    await stakingContract.connect(invester).stake(invester.address, amount);
  }

  describe("Deployment", function () {
    it("should deploy Staking Contract", async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, yieldSupplier] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      yieldLimit = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(invester2.address, yieldLimit);

      stakingContract = await stakingContractFactory.deploy(yieldLimit, await testToken.getAddress(), yieldSupplier.address, 2, "1000000000000");

      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), yieldLimit);
    });
  });
  describe("Stake", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, yieldSupplier] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      yieldLimit = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(yieldSupplier.address, yieldLimit);

      stakingContract = await stakingContractFactory.deploy(yieldLimit, await testToken.getAddress(), yieldSupplier.address, 2, "1000000000000");

      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), yieldLimit);
    });

    it("should stake tokens", async function () {
      await stake(invester1, supplyAmountInvester);
    });

    it("should be able to stake multiple times", async function () {
      supplyAmountInvester = ethers.parseEther("1");

      await stake(invester1, supplyAmountInvester);
      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(supplyAmountInvester);

      await stake(invester1, supplyAmountInvester);
      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(ethers.parseEther("2"));

      await stake(invester1, supplyAmountInvester);
      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(ethers.parseEther("3"));
    });

    it("should not be able to stake tokens if amount or address is zero", async function () {
      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await expect(stakingContract.connect(invester1).stake(ethers.ZeroAddress, supplyAmountInvester)).to.be.revertedWithCustomError(stakingContract, 'ZeroStaker');
      await expect(stakingContract.connect(invester1).stake(invester1.address, 0)).to.be.revertedWithCustomError(stakingContract, 'ZeroAmount');
    });
  });
  describe("Withdraw", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, yieldSupplier] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      yieldLimit = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(yieldSupplier.address, yieldLimit);

      stakingContract = await stakingContractFactory.deploy(yieldLimit, await testToken.getAddress(), yieldSupplier.address, 2, "1000000000000");

      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), yieldLimit);
    });

    it("should be able to stake multiple times and withdraw", async function () {
      supplyAmountInvester = ethers.parseEther("1");
      await stake(invester1, supplyAmountInvester);

      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(supplyAmountInvester);

      await stake(invester1, supplyAmountInvester);

      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(ethers.parseEther("2"));

      await stake(invester1, supplyAmountInvester);

      expect((await stakingContract.stakes(invester1.address)).stakedAmount).to.equals(ethers.parseEther("3"));

      expect(await stakingContract.connect(invester1).withdraw()).to.emit(testToken, 'transfer');
    });

    it("should not be able to withdraw more than yield limit", async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      
      stakingContract = await stakingContractFactory.deploy("1000", await testToken.getAddress(), yieldSupplier.address, 2, "1000000000000");
      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), "10000");

      supplyAmountInvester = ethers.parseEther("10");
      await testToken.mint(invester1.address, supplyAmountInvester);

      await stake(invester1, supplyAmountInvester);

      await testToken.mint(invester1.address, supplyAmountInvester);

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await expect(stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester)).to.be.revertedWithCustomError(stakingContract, 'YieldLimitExceeded');

      expect(await stakingContract.connect(invester1).withdraw()).to.emit(testToken, 'transfer');
    });
  });
  describe("Pause", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, yieldSupplier] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      yieldLimit = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(yieldSupplier.address, yieldLimit);

      stakingContract = await stakingContractFactory.deploy(yieldLimit, await testToken.getAddress(), yieldSupplier.address, 2, "1000000000000");

      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), yieldLimit);
    });

    it("should be able to pause contract", async function () {
      await stakingContract.pauseStaking();
      expect(await stakingContract.paused()).to.equals(true);
    });

    it("should not be able to pause contract if not called by owner", async function () {
      await expect(stakingContract.connect(invester1).pauseStaking()).to.be.revertedWithCustomError(stakingContract, 'OwnableUnauthorizedAccount');
    });

    it("should be able to withdraw funds after pausing", async function () {
      supplyAmountInvester = ethers.parseEther("1");
      await stake(invester1, supplyAmountInvester);
      
      await stakingContract.pauseStaking();

      expect(await stakingContract.connect(invester1).withdraw()).to.emit(testToken, 'transfer');
    });

    it("should not be able to stake after pausing", async function () {
      await stakingContract.pauseStaking();
      expect(await stakingContract.paused()).to.equals(true);

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await expect(stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester)).to.be.revertedWithCustomError(stakingContract, 'EnforcedPause');
    });
  });
  describe("Calculate rewards", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("PausableStake");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, yieldSupplier] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      yieldLimit = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(yieldSupplier.address, yieldLimit);

      stakingContract = await stakingContractFactory.deploy(yieldLimit, await testToken.getAddress(), yieldSupplier.address, 2, "100000000000");

      await testToken.connect(yieldSupplier).approve(stakingContract.getAddress(), yieldLimit);
    });

    it("should be able to calculate rewards", async function () {
      rewardPerBlock = Math.floor((100000000000 * 2) / 86400);

      await stake(invester1, supplyAmountInvester);

      const blocks = 1000;

      await mine(blocks);

      expect(await stakingContract.calculateTotalReward(invester1.address)).to.equals(ethers.toBigInt(rewardPerBlock * blocks) * supplyAmountInvester / ethers.parseEther("1"));
    });
    it("should be able to calculate reward and reward should not exceed yield limit", async function () {
      rewardPerBlock = Math.floor((100000000000 * 2) / 86400);

      await stake(invester1, supplyAmountInvester);

      await mine(ethers.toBigInt("1000000000000000"));

      expect(await stakingContract.calculateTotalReward(invester1.address)).to.equals(yieldLimit);
    });
  });
});
