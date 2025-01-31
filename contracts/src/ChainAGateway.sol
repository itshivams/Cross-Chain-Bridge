// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

interface IChainGateway {
    event Locked(address indexed user, uint256 amount, uint256 timestamp, uint256 nonce);
    event Unlocked(address indexed user, uint256 amount, uint256 timestamp);
    
    function lock(uint256 amount, uint256 nonce, bytes calldata signature) external;
    function unlock(uint256 amount, bytes32[] calldata merkleProof) external;
}

contract ChainAGateway is IChainGateway, Ownable, ReentrancyGuard {
    IERC20 public immutable tokenA;
    address public chainBGateway;
    mapping(uint256 => bool) public processedNonces;
    address public immutable trustedSigner;
    bytes32 public merkleRoot;

    constructor(address _tokenA, address _trustedSigner) {
        require(_tokenA != address(0) && _trustedSigner != address(0), "Invalid addresses");
        tokenA = IERC20(_tokenA);
        trustedSigner = _trustedSigner;
    }

    function setChainBGateway(address _chainBGateway) external onlyOwner {
        require(_chainBGateway != address(0), "Invalid gateway address");
        chainBGateway = _chainBGateway;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
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

    function lock(uint256 amount, uint256 nonce, bytes calldata signature) external override nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(!processedNonces[nonce], "Nonce already used");
        require(verifySignature(msg.sender, amount, nonce, signature), "Invalid signature");
        require(tokenA.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        processedNonces[nonce] = true;
        emit Locked(msg.sender, amount, block.timestamp, nonce);
    }

    function unlock(uint256 amount, bytes32[] calldata merkleProof) external override onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenA.balanceOf(address(this)) >= amount, "Insufficient balance");
        
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle proof");
        
        tokenA.transfer(msg.sender, amount);
        emit Unlocked(msg.sender, amount, block.timestamp);
    }
}
