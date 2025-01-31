pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenB is IERC20, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    address public gateway;
    string public name = "WrappedTokenA";
    string public symbol = "wTKA";
    uint8 public decimals = 18;

    modifier onlyGateway() {
        require(msg.sender == gateway, "Not gateway");
        _;
    }

    function setGateway(address _gateway) external onlyOwner {
        require(gateway == address(0), "Gateway already set");
        gateway = _gateway;
    }

    function mint(address to, uint256 amount) external onlyGateway {
        _totalSupply += amount;
        _balances[to] += amount;
    }

    function burn(address from, uint256 amount) external onlyGateway {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _totalSupply -= amount;
    }
}