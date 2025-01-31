pragma solidity ^0.8.18;

import "./interfaces/IChainGateway.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainAGateway is IChainGateway, Ownable {
    IERC20 public tokenA;

  
    address public chainBGateway;

    constructor(address _tokenA) {
        tokenA = IERC20(_tokenA);
    }

    function setChainBGateway(address _chainBGateway) external onlyOwner {
        chainBGateway = _chainBGateway;
    }

    function lock(uint256 amount) external override {
        require(tokenA.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Locked(msg.sender, amount, block.timestamp);
    }

    function unlock(uint256 amount) external override onlyOwner {
        require(tokenA.balanceOf(address(this)) >= amount, "Insufficient balance");
        tokenA.transfer(msg.sender, amount);
        emit Unlocked(msg.sender, amount, block.timestamp);
    }


    function mint(address to, uint256 amount) external override {}


    function burn(address from, uint256 amount) external override {}

}
