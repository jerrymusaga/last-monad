// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {LastMonad} from "../src/LastMonad.sol";

contract DeployLastMonad is Script {
    function run() external returns (LastMonad) {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy LastMonad contract
        LastMonad lastMonad = new LastMonad();

        console.log("LastMonad deployed to:", address(lastMonad));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Chain ID:", block.chainid);

        // Stop broadcasting
        vm.stopBroadcast();

        return lastMonad;
    }
}
