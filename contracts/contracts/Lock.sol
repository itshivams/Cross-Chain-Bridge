// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";


contract Lock is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =============================================================
    //                           ROLES
    // =============================================================


    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // =============================================================
    //                         STRUCTS
    // =============================================================

    struct LockRecord {
        bool isERC721;
        address token;
        address locker;
        uint256 amountOrId;
        bool unlocked;
    }

    // =============================================================
    //                           EVENTS
    // =============================================================

 
    event Locked(
        bytes32 indexed lockId,
        address indexed locker,
        address indexed token,
        bool isERC721,
        uint256 amountOrId
    );

 
    event Unlocked(
        bytes32 indexed lockId,
        address indexed receiver
    );

    // =============================================================
    //                          STORAGE
    // =============================================================

   
    mapping(address => uint256) public userNonce;

   
    mapping(bytes32 => LockRecord) public lockRecords;

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // =============================================================
    //                       EXTERNAL LOGIC
    // =============================================================

   
    function lockERC20(address token, uint256 amount)
        external
        nonReentrant
    {
        require(amount > 0, "Lock: Amount must be > 0");
        require(_isERC721(token) == false, "Lock: Token is ERC721, use lockERC721");


        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

     
        uint256 nonce = userNonce[msg.sender];
        bytes32 lockId = keccak256(abi.encodePacked(msg.sender, nonce));

  
        lockRecords[lockId] = LockRecord({
            isERC721: false,
            token: token,
            locker: msg.sender,
            amountOrId: amount,
            unlocked: false
        });

        userNonce[msg.sender] = nonce + 1;

        emit Locked(lockId, msg.sender, token, false, amount);
    }

   
 
    function lockERC721(address nftContract, uint256 tokenId)
        external
        nonReentrant
    {
        require(_isERC721(nftContract) == true, "Lock: Not a valid ERC721 contract");

      
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

      
        uint256 nonce = userNonce[msg.sender];
        bytes32 lockId = keccak256(abi.encodePacked(msg.sender, nonce));

 
        lockRecords[lockId] = LockRecord({
            isERC721: true,
            token: nftContract,
            locker: msg.sender,
            amountOrId: tokenId,
            unlocked: false
        });

        userNonce[msg.sender] = nonce + 1;

        emit Locked(lockId, msg.sender, nftContract, true, tokenId);
    }

  
    function unlock(bytes32 lockId, address receiver)
        external
        nonReentrant
        onlyRole(RELAYER_ROLE) 
    {
        LockRecord storage record = lockRecords[lockId];
        require(!record.unlocked, "Lock: Already unlocked");
        require(record.locker != address(0), "Lock: Invalid lockId");
  

        record.unlocked = true;

        if (record.isERC721) {
            // Return the NFT
            IERC721(record.token).transferFrom(address(this), receiver, record.amountOrId);
        } else {
            // Return ERC-20 tokens
            IERC20(record.token).safeTransfer(receiver, record.amountOrId);
        }

        emit Unlocked(lockId, receiver);
    }

    // =============================================================
    //                        ADMIN METHODS
    // =============================================================


    function grantRelayerRole(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

  
    function revokeRelayerRole(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }

    // =============================================================
    //                       INTERNAL HELPERS
    // =============================================================


    function _isERC721(address token) internal view returns (bool) {
        bytes4 ERC721_INTERFACE_ID = 0x80ac58cd;
        return ERC165Checker.supportsInterface(token, ERC721_INTERFACE_ID);
    }
}
