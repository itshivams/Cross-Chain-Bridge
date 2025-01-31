pragma solidity ^0.8.18;

import "./interfaces/IChainGateway.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenB.sol";

contract ChainBGateway is IChainGateway, Ownable {
    TokenB public tokenB;
    address public chainAGateway;

    constructor(address _tokenB) {
        tokenB = TokenB(_tokenB);
    }

    function setChainAGateway(address _chainAGateway) external onlyOwner {
        chainAGateway = _chainAGateway;
    }

    function lock(uint256 amount) external override {
    }

  
    function unlock(uint256 amount) external override onlyOwner {}

    function mint(address to, uint256 amount) external override onlyOwner {
        tokenB.mint(to, amount);
        emit Minted(to, amount, block.timestamp);
    }

    function burn(address from, uint256 amount) external override onlyOwner {
        tokenB.burn(from, amount);
        emit Burned(from, amount, block.timestamp);
    }
}
