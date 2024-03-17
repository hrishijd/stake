# Pausable Staking Contract

## Introduction

The PausableStake smart contract is designed to facilitate staking of ERC20 tokens for rewards. It allows users to stake their tokens and earn rewards based on a pre-defined yield per block. The contract is capable of pausing staking operations and manages the distribution of rewards to stakers from a specified yield provider account.

## Features

- **Staking**: Users can stake ERC20 tokens into the contract.
- **Reward Calculation**: Rewards are calculated based on the amount of tokens staked and the duration of staking.
- **Pausing**: The contract can be paused by the owner, preventing further staking activities.
- **Yield Limit**: There is a pre-defined limit on the total amount of rewards that can be distributed.
- **Withdrawal**: Stakers can withdraw their staked tokens along with earned rewards.

## Prerequisites

Before deploying and testing the PausableStake contract, ensure the following prerequisites are met:

**Node.js and npm**: Install Node.js and npm (Node Package Manager) if not already installed on your system.

## Dependencies
- Solidity v0.8.21
- OpenZeppelin Contracts v5.0.2
- Hardhat v2.21.0(for development and testing)

## Setup
To set up this project locally and interact with the smart contract, follow these steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/hrishijd/stake.git
    ```

2. Navigate to the project directory:

    ```bash
    cd stake
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Tests
To run tests for the smart contract, use the following command:

```bash
npx hardhat test
```

To generate coverage report, use the following command:

```bash
npx hardhat coverage
```
Currently the tests have an extensive 100% coverage of the smart contracts.

## Deploying Contract
Add `YOUR_NETWORK` with the desired network configuration to `hardhat.config.js` networks section, if not already present.

To deploy the smart contracts to a network, modify the deployment script as necessary (located in `scripts/` directory) and then use the following command:

```bash
npx hardhat run scripts/deploy.js --network YOUR_NETWORK
```
After this you will need to approve Staking contract for the token limit of ERC20 tokens by the supplier address after deployment.

*Note: This contract is designed for ethereum and its layer 2 solutions, which have a constant block time(interval after which next block is mined), not to be deployed on networks with variable block time or where block time depends on abundace of transactions, and example of blockchain with variable block time is Mantle.

## Error Handling
The contract throws specific errors such as 'ZeroStaker', 'ZeroAmount', and 'YieldLimitExceeded' in case of invalid inputs or exceeding yield limits.

## Experimental
This contract is marked as experimental and may undergo changes or updates in the future. It is recommended to thoroughly test the contract in a safe environment before deployment on any mainnet.
