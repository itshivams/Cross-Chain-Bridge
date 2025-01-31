// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProofOfTransfer.sol";

contract ChainGateway {
    ProofOfTransfer public proofContract;
    address public owner;
    mapping(address => bool) public authorizedRelayers;

    event AssetLocked(address indexed sender, address indexed receiver, uint256 amount, bytes32 transferHash, uint256 timestamp);
    event AssetUnlocked(address indexed sender, address indexed receiver, uint256 amount, bytes32 transferHash, uint256 timestamp);
    event RelayerUpdated(address indexed relayer, bool status);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RelayerProcessed(bytes32 indexed transferHash, address indexed relayer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    modifier onlyRelayer() {
        require(authorizedRelayers[msg.sender], "Not an authorized relayer");
        _;
    }
    
    constructor(address _proofContract) {
        require(_proofContract != address(0), "Invalid proof contract address");
        owner = msg.sender;
        proofContract = ProofOfTransfer(_proofContract);
    }
    
    function setRelayer(address relayer, bool status) external onlyOwner {
        require(relayer != address(0), "Invalid relayer address");
        authorizedRelayers[relayer] = status;
        emit RelayerUpdated(relayer, status);
    }
    
    function lockAsset(address receiver, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        
        bytes32 transferHash = proofContract.logTransfer(msg.sender, receiver, amount);
        
        emit AssetLocked(msg.sender, receiver, amount, transferHash, block.timestamp);
    }
    
    function unlockAsset(address sender, address receiver, uint256 amount, bytes32 transferProof) external onlyRelayer {
        require(amount > 0, "Amount must be greater than zero");
        require(proofContract.getTransferProof(transferProof).timestamp != 0, "Invalid transfer proof");
        
        bytes32 transferHash = proofContract.logTransfer(sender, receiver, amount);
        
        emit AssetUnlocked(sender, receiver, amount, transferHash, block.timestamp);
        emit RelayerProcessed(transferHash, msg.sender);
    }
    
    function updateOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}