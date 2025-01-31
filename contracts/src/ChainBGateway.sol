// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    IERC20 public immutable tokenB;
    address public chainAGateway;
    mapping(uint256 => bool) public processedNonces;
    address public immutable trustedSigner;

    constructor(address _tokenB, address _trustedSigner) {
        require(_tokenB != address(0) && _trustedSigner != address(0), "Invalid addresses");
        tokenB = IERC20(_tokenB);
        trustedSigner = _trustedSigner;
    }

    function setChainAGateway(address _chainAGateway) external onlyOwner {
        require(_chainAGateway != address(0), "Invalid gateway address");
        chainAGateway = _chainAGateway;
    }

    function mint(address to, uint256 amount, uint256 nonce, bytes calldata signature) external override onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(!processedNonces[nonce], "Nonce already used");
        require(verifySignature(to, amount, nonce, signature), "Invalid signature");
        processedNonces[nonce] = true;
        require(tokenB.transfer(to, amount), "Mint transfer failed");
        emit Minted(to, amount, block.timestamp);
    }

    function verifySignature(address user, uint256 amount, uint256 nonce, bytes calldata signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(user, amount, nonce, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s) == trustedSigner;
    }

    function splitSignature(bytes calldata sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
    }

    function burn(address from, uint256 amount) external override onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenB.balanceOf(from) >= amount, "Insufficient balance");
        require(tokenB.transferFrom(from, address(this), amount), "Burn transfer failed");
        emit Burned(from, amount, block.timestamp);
    }
}
