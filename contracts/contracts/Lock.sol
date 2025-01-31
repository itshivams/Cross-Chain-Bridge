// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

/**
 * @title Lock
 * @notice A contract that locks ERC-20 or ERC-721 tokens,
 *         then allows an authorized relayer to unlock them.
 *
 * @dev Uses AccessControl for admin/relayer roles, SafeERC20 for safe token transfers,
 *      and a custom nonReentrant modifier to prevent reentrancy.
 */
contract Lock is AccessControl {
    using SafeERC20 for IERC20;

    // =============================================================
    //                      CUSTOM REENTRANCY GUARD
    // =============================================================

    bool private _locked; // Simple reentrancy lock variable

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // =============================================================
    //                           ROLES
    // =============================================================

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // =============================================================
    //                         STRUCTS
    // =============================================================

    struct LockRecord {
        bool isERC721;      // true if it's ERC-721
        address token;       // ERC-20 or ERC-721 contract address
        address locker;      // who locked the asset
        uint256 amountOrId;  // amount (ERC-20) or tokenId (ERC-721)
        bool unlocked;       // tracks if it’s already unlocked
    }

    // =============================================================
    //                           EVENTS
    // =============================================================

    /**
     * @notice Emitted when tokens (ERC-20 or ERC-721) are locked.
     * @param lockId  Unique identifier for this locked record.
     * @param locker  The address that locked the token(s).
     * @param token   The token contract address.
     * @param isERC721 Whether it's ERC-721 (true) or ERC-20 (false).
     * @param amountOrId Amount of tokens (ERC-20) or Token ID (ERC-721).
     */
    event Locked(
        bytes32 indexed lockId,
        address indexed locker,
        address indexed token,
        bool isERC721,
        uint256 amountOrId
    );

    /**
     * @notice Emitted when tokens are unlocked.
     * @param lockId  The unique ID of the locked record being unlocked.
     * @param receiver The address receiving the unlocked tokens.
     */
    event Unlocked(
        bytes32 indexed lockId,
        address indexed receiver
    );

    // =============================================================
    //                          STORAGE
    // =============================================================

    /**
     * @dev Each address has an incrementing nonce used to generate unique lock IDs.
     */
    mapping(address => uint256) public userNonce;

    /**
     * @dev Mapping from lockId => details about the locked asset.
     */
    mapping(bytes32 => LockRecord) public lockRecords;

    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // =============================================================
    //                       EXTERNAL LOGIC
    // =============================================================

    /**
     * @notice Lock ERC-20 tokens in this contract.
     * @param token  The address of the ERC-20 token.
     * @param amount Number of tokens to lock.
     */
    function lockERC20(address token, uint256 amount)
        external
        nonReentrant
    {
        require(amount > 0, "Lock: Amount must be > 0");
        require(!_isERC721(token), "Lock: Token is ERC721, use lockERC721");

        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate a unique lockId using (locker, nonce)
        uint256 nonce = userNonce[msg.sender];
        bytes32 lockId = keccak256(abi.encodePacked(msg.sender, nonce));

        // Store lock details
        lockRecords[lockId] = LockRecord({
            isERC721: false,
            token: token,
            locker: msg.sender,
            amountOrId: amount,
            unlocked: false
        });

        // Increment the user's nonce
        userNonce[msg.sender] = nonce + 1;

        emit Locked(lockId, msg.sender, token, false, amount);
    }

    /**
     * @notice Lock an ERC-721 token (NFT) in this contract.
     * @param nftContract The address of the ERC-721 contract.
     * @param tokenId The tokenId of the NFT to lock.
     */
    function lockERC721(address nftContract, uint256 tokenId)
        external
        nonReentrant
    {
        require(_isERC721(nftContract), "Lock: Not a valid ERC721 contract");

        // Transfer NFT from user to this contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // Calculate a unique lockId
        uint256 nonce = userNonce[msg.sender];
        bytes32 lockId = keccak256(abi.encodePacked(msg.sender, nonce));

        // Store lock details
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

    /**
     * @notice Unlock previously locked ERC-20 or ERC-721 tokens (only by RELAYER_ROLE).
     * @param lockId   The unique identifier for the lock record.
     * @param receiver The address to receive the unlocked asset.
     */
    function unlock(bytes32 lockId, address receiver)
        external
        nonReentrant
        onlyRole(RELAYER_ROLE)
    {
        LockRecord storage record = lockRecords[lockId];
        require(!record.unlocked, "Lock: Already unlocked");
        require(record.locker != address(0), "Lock: Invalid lockId");

        // Mark as unlocked
        record.unlocked = true;

        if (record.isERC721) {
            // Transfer the NFT back to the receiver
            IERC721(record.token).transferFrom(address(this), receiver, record.amountOrId);
        } else {
            // Transfer the ERC-20 tokens
            IERC20(record.token).safeTransfer(receiver, record.amountOrId);
        }

        emit Unlocked(lockId, receiver);
    }

    // =============================================================
    //                        ADMIN METHODS
    // =============================================================

    /**
     * @notice Grant the RELAYER_ROLE to a relayer address.
     */
    function grantRelayerRole(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

    /**
     * @notice Revoke the RELAYER_ROLE from a relayer address.
     */
    function revokeRelayerRole(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }

    // =============================================================
    //                       INTERNAL HELPERS
    // =============================================================

    /**
     * @dev Check if `token` supports the ERC-721 interface (0x80ac58cd).
     */
    function _isERC721(address token) internal view returns (bool) {
        // 0x80ac58cd => ERC-721 interface ID
        return ERC165Checker.supportsInterface(token, 0x80ac58cd);
    }
}
