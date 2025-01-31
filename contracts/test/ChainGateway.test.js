const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("ChainGateway Cross-Chain Transfer Tests", function () {
    let deployer, user1, user2, tokenA, tokenB, chainAGateway, chainBGateway, merkleTree, merkleRoot;

    before(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        console.log("Deploying TokenA...");
        const TokenA = await ethers.getContractFactory("TokenA");
        tokenA = await TokenA.deploy();
        await tokenA.waitForDeployment();
        console.log("TokenA deployed at:", await tokenA.getAddress());

        console.log("Deploying ChainAGateway...");
        const ChainAGateway = await ethers.getContractFactory("ChainAGateway");
        chainAGateway = await ChainAGateway.deploy(await tokenA.getAddress(), deployer.address);
        await chainAGateway.waitForDeployment();
        console.log("ChainAGateway deployed at:", await chainAGateway.getAddress());

        console.log("Deploying TokenB...");
        const TokenB = await ethers.getContractFactory("TokenB");
        tokenB = await TokenB.deploy();
        await tokenB.waitForDeployment();
        console.log("TokenB deployed at:", await tokenB.getAddress());

        console.log("Deploying ChainBGateway...");
        const ChainBGateway = await ethers.getContractFactory("ChainBGateway");
        chainBGateway = await ChainBGateway.deploy(await tokenB.getAddress(), deployer.address);
        await chainBGateway.waitForDeployment();
        console.log("ChainBGateway deployed at:", await chainBGateway.getAddress());

        // Mint and approve tokens for testing
        await tokenA.transfer(user1.address, 1000);
        await tokenA.connect(user1).approve(await chainAGateway.getAddress(), 1000);

        // Generate Merkle Tree for verification
        const leaves = [keccak256(user1.address + 100)];
        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        merkleRoot = merkleTree.getHexRoot();
        await chainAGateway.setMerkleRoot(merkleRoot);
    });

    it("Should allow user to lock tokens on Chain A", async function () {
        await expect(chainAGateway.connect(user1).lock(100, 1, "0xSignature"))
            .to.emit(chainAGateway, "Locked")
            .withArgs(user1.address, 100, any, 1);

        const balance = await tokenA.balanceOf(await chainAGateway.getAddress());
        expect(balance).to.equal(100);
    });

    it("Should allow Chain B Gateway to mint tokens", async function () {
        await expect(chainBGateway.connect(deployer).mint(user1.address, 100, 1, "0xSignature"))
            .to.emit(chainBGateway, "Minted")
            .withArgs(user1.address, 100, any);

        const balance = await tokenB.balanceOf(user1.address);
        expect(balance).to.equal(100);
    });

    it("Should allow user to unlock tokens with valid Merkle proof", async function () {
        const leaf = keccak256(user1.address + 100);
        const proof = merkleTree.getHexProof(leaf);

        await expect(chainAGateway.connect(deployer).unlock(100, proof))
            .to.emit(chainAGateway, "Unlocked")
            .withArgs(user1.address, 100, any);
        
        const balance = await tokenA.balanceOf(user1.address);
        expect(balance).to.equal(100);
    });

    it("Should prevent unlocking with invalid Merkle proof", async function () {
        const invalidProof = ["0xFakeProof"];

        await expect(chainAGateway.connect(deployer).unlock(100, invalidProof))
            .to.be.revertedWith("Invalid Merkle proof");
    });
});
