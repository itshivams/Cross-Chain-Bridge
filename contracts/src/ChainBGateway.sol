pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IChainGateway {
    event Minted(address indexed user, uint256 amount, uint256 timestamp);
    event Burned(address indexed user, uint256 amount, uint256 timestamp);

    function mint(address to, uint256 amount, uint256 nonce, bytes calldata signature) external;
    function burn(address from, uint256 amount) external;
}

contract ChainBGateway is IChainGateway, Ownable, ReentrancyGuard {
    IERC20 public tokenB;
    address public chainAGateway;
    mapping(uint256 => bool) public processedNonces;

    constructor(address _tokenB) {
        tokenB = IERC20(_tokenB);
    }

    function setChainAGateway(address _chainAGateway) external onlyOwner {
        chainAGateway = _chainAGateway;
    }

    function mint(address to, uint256 amount, uint256 nonce, bytes calldata signature) external override onlyOwner nonReentrant {
        require(!processedNonces[nonce], "Nonce already used");
        processedNonces[nonce] = true;
        tokenB.transfer(to, amount);
        emit Minted(to, amount, block.timestamp);
    }

    function burn(address from, uint256 amount) external override onlyOwner nonReentrant {
        require(tokenB.balanceOf(from) >= amount, "Insufficient balance");
        tokenB.transferFrom(from, address(this), amount);
        emit Burned(from, amount, block.timestamp);
    }
}