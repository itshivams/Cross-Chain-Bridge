const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Cross-Chain Asset Transfer", function () {
  let owner, user, relayer;
  let chainAGateway, chainBGateway, proofOfTransfer, tokenA, tokenB;
  let trustedSigner;
  let merkleRoot, validMerkleProof;
  let nonce = 1;

  before(async function () {
    [owner, user, relayer] = await ethers.getSigners();

    console.log("Deploying Token A...");
    const TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy();
    await tokenA.waitForDeployment();
    console.log("TokenA deployed at:", await tokenA.getAddress());

    console.log("Deploying Token B...");
    const TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy(owner.address);
    await tokenB.waitForDeployment();
    console.log("TokenB deployed at:", await tokenB.getAddress());

    console.log("Deploying Proof of Transfer...");
    const ProofOfTransfer = await ethers.getContractFactory("ProofOfTransfer");
    proofOfTransfer = await ProofOfTransfer.deploy();
    await proofOfTransfer.waitForDeployment();
    console.log("ProofOfTransfer deployed at:", await proofOfTransfer.getAddress());

    console.log("Deploying Chain A Gateway...");
    trustedSigner = owner.address;
    const ChainAGateway = await ethers.getContractFactory("ChainAGateway");
    chainAGateway = await ChainAGateway.deploy(
      await tokenA.getAddress(),
      trustedSigner
    );
    await chainAGateway.waitForDeployment();
    console.log("ChainAGateway deployed at:", await chainAGateway.getAddress());

    console.log("Deploying Chain B Gateway...");
    const ChainBGateway = await ethers.getContractFactory("ChainBGateway");
    chainBGateway = await ChainBGateway.deploy(
      await tokenB.getAddress(),
      trustedSigner
    );
    await chainBGateway.waitForDeployment();
    console.log("ChainBGateway deployed at:", await chainBGateway.getAddress());

    console.log("Setting TokenB gateway...");
    await tokenB.setGateway(await chainBGateway.getAddress());

    const { keccak256, toUtf8Bytes } = ethers;
    merkleRoot = keccak256(toUtf8Bytes("valid_root"));
    validMerkleProof = [keccak256(toUtf8Bytes("valid_proof"))];

    console.log("✅ Setup complete!");
  });

  it("Should allow a user to lock assets on Chain A", async function () {
    const chainAGatewayAddress = await chainAGateway.getAddress();
    const amount = 100;
    const localNonce = 1;

    await tokenA.transfer(user.address, amount);

    await tokenA.connect(user).approve(chainAGatewayAddress, amount);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address"],
      [user.address, amount, localNonce, chainAGatewayAddress]
    );
    const signature = await owner.signMessage(ethers.getBytes(messageHash));

    await expect(
      chainAGateway.connect(user).lock(amount, localNonce, signature)
    ).to.emit(chainAGateway, "Locked")
     .withArgs(user.address, amount, anyValue, localNonce);
  });

  it("Should prevent replay attacks using nonces", async function () {
    const chainAGatewayAddress = await chainAGateway.getAddress();
    const amount = 100;
    const localNonce = 1;

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address"],
      [user.address, amount, localNonce, chainAGatewayAddress]
    );

    const signature = await owner.signMessage(ethers.getBytes(messageHash));


    await expect(
      chainAGateway.connect(user).lock(amount, localNonce, signature)
    ).to.be.revertedWith("Nonce already used");
  });

  it("Should fail unlocking without a valid Merkle proof", async function () {

    await expect(chainAGateway.connect(user).unlock(100, []))
      .to.be.reverted;
  });

  it("Should mint wrapped tokens on Chain B with a valid signature", async function () {
    const chainBGatewayAddress = await chainBGateway.getAddress();
    const amount = 50;
    const localNonce = 100; 

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address"],
      [user.address, amount, localNonce, chainBGatewayAddress]
    );
    const signature = await owner.signMessage(ethers.getBytes(messageHash));

    await expect(
      chainBGateway.connect(owner).mint(user.address, amount, localNonce, signature)
    ).to.emit(chainBGateway, "Minted")
     .withArgs(user.address, amount, anyValue);
  });

  it("Should prevent unauthorized minting", async function () {
    const localNonce = 101;
    const badSignature = "0x" + "11".repeat(65); 

    await expect(
      chainBGateway.connect(owner).mint(user.address, 999, localNonce, badSignature)
    ).to.be.revertedWith("Invalid signature");
  });

  it("Should allow burning of wrapped tokens on Chain B", async function () {
  
    const chainBGatewayAddress = await chainBGateway.getAddress();
    const amount = 200;
    const localNonce = 102;


    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address"],
      [user.address, amount, localNonce, chainBGatewayAddress]
    );
    const signature = await owner.signMessage(ethers.getBytes(messageHash));


    await chainBGateway.connect(owner).mint(user.address, amount, localNonce, signature);

   
    await expect(
      chainBGateway.connect(user).burn(user.address, amount, [])
    ).to.emit(chainBGateway, "Burned")
     .withArgs(user.address, amount, anyValue);
  });
});
