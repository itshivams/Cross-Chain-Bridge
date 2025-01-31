
pragma solidity ^0.8.18;

interface IChainGateway {
    event Locked(address indexed user, uint256 amount, uint256 timestamp);
    event Unlocked(address indexed user, uint256 amount, uint256 timestamp);
    event Minted(address indexed user, uint256 amount, uint256 timestamp);
    event Burned(address indexed user, uint256 amount, uint256 timestamp);

    function lock(uint256 amount) external;
    function unlock(uint256 amount) external;
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}
