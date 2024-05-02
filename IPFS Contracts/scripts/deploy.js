const hre= require("hardhat");
const main = async () => {
    const IPFS = await hre.ethers.getContractFactory("IPFS");
    const ipfs = await IPFS.deploy();
    await ipfs.waitForDeployment();
    console.log("IPFS deployed to:", await ipfs.getAddress());
}

const runmain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

runmain();