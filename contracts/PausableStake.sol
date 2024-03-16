//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PausableStake
 * @author Hrishi Jadhav
 * @dev A contract for staking ERC20 tokens for rewards, specifically rewards to be deducted from a predecided account.
 * @custom:experimental This is an experimental contract.
 */
contract PausableStake is Ownable, Pausable {
    /**
     * @dev Precision for reward calculation
     */
    uint256 constant PRECISION = 1e18;

    /**
     * @dev Total tokens that can be be deducted
     */
    uint256 immutable yieldLimit;

    /**
     * @dev Address that tokens will be deducted from
     */
    address immutable yieldProvider;

    /**
     * @dev The ERC20 token being staked
     */
    IERC20 immutable token;

    /**
     * @dev Yield generated over span of 1 block for 1e18 tokens
     */
    uint256 immutable yieldPerBlock;

    /**
     * @dev Total yield earned
     */
    uint256 yieldEarned;

    /**
     * @dev Block to pause staking on
     */
    uint256 pauseBlock;

    /**
     * @dev Staking data for each staker
     */
    struct StakeData {
        uint256 blockNumber;
        uint256 stakedAmount;
        uint256 rewardEarned;
    }

    /**
     * @dev Mapping of staker address to their staking data
     */
    mapping(address => StakeData) public stakes;

    /**
     * @dev Event emitted when a staker stakes tokens
     */
    event Staked(address indexed staker, uint256 amount);

    /**
     * @dev Event emitted when a staker withdraws tokens
     */
    event Withdrawn(
        address indexed staker,
        uint256 stakedAmount,
        uint256 reward
    );

    // Errors
    error ZeroStaker();
    error ZeroAmount();
    error YieldLimitExceeded();

    /**
     * @dev Constructor to initialize the StakingContract
     * @param yieldLimit_ The maximum yield approved
     * @param token_ The ERC20 token contract address
     * @param yieldProvider_ The address that will approve ERC20 tokens to be sent to the stakers
     * @param blockTimeSplit The time interval in seconds before a block is mined(specific to the blockchain)
     * @param yield The number of tokens that are provided as a yield per 1e^18 tokens per day
     */
    constructor(
        uint256 yieldLimit_,
        address token_,
        address yieldProvider_,
        uint256 blockTimeSplit,
        uint256 yield
    ) Ownable(msg.sender) {
        yieldLimit = yieldLimit_;
        token = IERC20(token_);
        yieldProvider = yieldProvider_;
        yieldPerBlock = (yield * blockTimeSplit) / 86400;
    }

    /**
     * @dev Function to allow a staker to stake tokens
     * @param staker The address of the staker
     * @param amount The amount of tokens to stake
     */
    function stake(address staker, uint amount) external whenNotPaused {
        if (staker == address(0)) {
            revert ZeroStaker();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        token.transferFrom(msg.sender, address(this), amount);

        StakeData memory stakeData = stakes[staker];

        if (stakeData.blockNumber == 0) {
            stakes[staker] = StakeData(block.number, amount, 0);
        } else {
            uint256 reward = _calculateReward(
                stakeData.blockNumber,
                stakeData.stakedAmount
            );

            if (yieldEarned + reward >= yieldLimit) {
                revert YieldLimitExceeded();
            } else {
                yieldEarned = yieldEarned + reward;
            }

            stakes[staker] = StakeData(
                block.number,
                stakeData.stakedAmount + amount,
                stakeData.rewardEarned + reward
            );
        }

        emit Staked(staker, amount);
    }

    /**
     * @dev Function to allow a staker to withdraw their staked tokens along with rewards
     */
    function withdraw() external {
        address staker = msg.sender;

        StakeData memory stakeData = stakes[staker];

        uint256 reward = _calculateReward(
            stakeData.blockNumber,
            stakeData.stakedAmount
        );

        if (yieldEarned + reward >= yieldLimit) {
            reward = yieldLimit - yieldEarned;
            yieldEarned = yieldLimit;
        } else {
            yieldEarned = yieldEarned + reward;
        }

        uint256 rewardAmountToSend = reward + stakeData.rewardEarned;

        delete stakes[staker];

        token.transfer(staker, stakeData.stakedAmount);
        token.transferFrom(yieldProvider, staker, rewardAmountToSend);

        emit Withdrawn(staker, stakeData.stakedAmount, rewardAmountToSend);
    }

    /**
     * @dev Function to pause staking, only callable by owner
     */
    function pauseStaking() external onlyOwner {
        _pause();
        pauseBlock = block.number;
    }

    /**
     * @dev Function to calculate reward for a staker after the last stake
     * @param rewardBlockNumber The block number at which the last staker staked last
     * @param stakedAmount The amount of tokens staked
     * @return reward The calculated reward after last stake
     */
    function _calculateReward(
        uint256 rewardBlockNumber,
        uint256 stakedAmount
    ) internal view returns (uint256 reward) {
        uint256 blockNumber = pauseBlock == 0 ? block.number : pauseBlock;

        reward =
            ((blockNumber - rewardBlockNumber) * stakedAmount * yieldPerBlock) /
            PRECISION;
    }

    /**
     * @dev Function to calculate total reward for a staker (including already earned rewards)
     * @param staker The address of the staker
     * @return reward The total calculated reward
     */
    function calculateTotalReward(
        address staker
    ) public view returns (uint256 reward) {
        StakeData memory stakeData = stakes[staker];
        reward = _calculateReward(stakeData.blockNumber, stakeData.stakedAmount);

        if (yieldEarned + reward >= yieldLimit) {
            reward = yieldLimit - yieldEarned;
        }

        reward = stakeData.rewardEarned + reward;
    }
}
