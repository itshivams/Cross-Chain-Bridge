pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IChainGateway {
    event Locked(address indexed user, uint256 amount, uint256 timestamp, uint256 nonce);
    event Unlocked(address indexed user, uint256 amount, uint256 timestamp);

    function lock(uint256 amount, uint256 nonce, bytes calldata signature) external;
    function unlock(uint256 amount) external;
}

contract ChainAGateway is IChainGateway, Ownable, ReentrancyGuard {
    IERC20 public tokenA;
    address public chainBGateway;
    mapping(uint256 => bool) public processedNonces;

    constructor(address _tokenA) {
        tokenA = IERC20(_tokenA);
    }

    function setChainBGateway(address _chainBGateway) external onlyOwner {
        chainBGateway = _chainBGateway;
    }

    function lock(uint256 amount, uint256 nonce, bytes calldata signature) external override nonReentrant {
        require(!processedNonces[nonce], "Nonce already used");
        require(tokenA.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        processedNonces[nonce] = true;
        emit Locked(msg.sender, amount, block.timestamp, nonce);
    }

    function unlock(uint256 amount) external override onlyOwner nonReentrant {
        require(tokenA.balanceOf(address(this)) >= amount, "Insufficient balance");
        tokenA.transfer(msg.sender, amount);
        emit Unlocked(msg.sender, amount, block.timestamp);
    }
}
