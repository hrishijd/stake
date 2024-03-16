pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestToken is ERC20 {

    constructor() ERC20("TestToken", "TTK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
