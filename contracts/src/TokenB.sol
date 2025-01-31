pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenB is ERC20 {
    address public gateway; 

    constructor() ERC20("WrappedTokenA", "wTKA") {
    }

    modifier onlyGateway() {
        require(msg.sender == gateway, "Not gateway");
        _;
    }

    function setGateway(address _gateway) external {
        require(gateway == address(0), "Gateway already set");
        gateway = _gateway;
    }

    function mint(address to, uint256 amount) external onlyGateway {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyGateway {
        _burn(from, amount);
    }
}
