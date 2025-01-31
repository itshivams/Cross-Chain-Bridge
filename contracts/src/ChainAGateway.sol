// SPDX-License-Identifier: MIT
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
    address public trustedSigner;

    constructor(address _tokenA, address _trustedSigner) {
        tokenA = IERC20(_tokenA);
        trustedSigner = _trustedSigner;
    }

    function setChainBGateway(address _chainBGateway) external onlyOwner {
        chainBGateway = _chainBGateway;
    }

    function verifySignature(address user, uint256 amount, uint256 nonce, bytes calldata signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(user, amount, nonce, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        address recoveredSigner = ecrecover(ethSignedMessageHash, v, r, s);
        return recoveredSigner == trustedSigner;
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function lock(uint256 amount, uint256 nonce, bytes calldata signature) external override nonReentrant {
        require(!processedNonces[nonce], "Nonce already used");
        require(verifySignature(msg.sender, amount, nonce, signature), "Invalid signature");
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
