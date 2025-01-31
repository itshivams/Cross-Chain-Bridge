// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofOfTransfer {
    
    struct TransferReceipt {
        bytes32 transferHash;
        uint256 timestamp;
        address sender;
        address receiver;
        uint256 amount;
    }
    
    event TransferLogged(
        bytes32 indexed transferHash,
        uint256 timestamp,
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
    
    mapping(bytes32 => TransferReceipt) public receipts;

    function logTransfer(
        address sender,
        address receiver,
        uint256 amount
    ) external returns (bytes32) {
        bytes32 transferHash = keccak256(abi.encodePacked(sender, receiver, amount, block.timestamp));
        receipts[transferHash] = TransferReceipt(transferHash, block.timestamp, sender, receiver, amount);
        
        emit TransferLogged(transferHash, block.timestamp, sender, receiver, amount);
        return transferHash;
    }
    
    function getTransferProof(bytes32 transferHash) external view returns (TransferReceipt memory) {
        require(receipts[transferHash].timestamp != 0, "Invalid transfer hash");
        return receipts[transferHash];
    }
}
