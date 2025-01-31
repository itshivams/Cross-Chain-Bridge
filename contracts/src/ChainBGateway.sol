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
    IERC20 public tokenB;
    address public chainAGateway;
    mapping(uint256 => bool) public processedNonces;
    address public trustedSigner;

    constructor(address _tokenB, address _trustedSigner) {
        tokenB = IERC20(_tokenB);
        trustedSigner = _trustedSigner;
    }

    function setChainAGateway(address _chainAGateway) external onlyOwner {
        chainAGateway = _chainAGateway;
    }

    function mint(address to, uint256 amount, uint256 nonce, bytes calldata signature) external override onlyOwner nonReentrant {
        require(!processedNonces[nonce], "Nonce already used");
        require(verifySignature(to, amount, nonce, signature), "Invalid signature");
        processedNonces[nonce] = true;
        tokenB.transfer(to, amount);
        emit Minted(to, amount, block.timestamp);
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

    function burn(address from, uint256 amount) external override onlyOwner nonReentrant {
        require(tokenB.balanceOf(from) >= amount, "Insufficient balance");
        tokenB.transferFrom(from, address(this), amount);
        emit Burned(from, amount, block.timestamp);
    }
}
