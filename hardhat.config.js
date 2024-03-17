require('@nomicfoundation/hardhat-toolbox');
const dotenv = require("dotenv");
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.21',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    arbitrumRinkeby: {
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    optimismKovan: {
      url: `https://optimism-kovan.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
    },
  },
  gasReporter: {
    enabled: true,
  },
};
