"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { monadTestnet } from "@/contexts/frame-wallet-context";

/**
 * Hook to automatically check and switch to Monad Testnet
 * Prompts user to add the network if they don't have it
 */
export function useNetworkCheck() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      console.log("Network check - isConnected:", isConnected, "chainId:", chainId, "target:", monadTestnet.id);

      // Only check if connected and not on Monad Testnet
      if (!isConnected || chainId === monadTestnet.id) {
        console.log("Skipping network switch - already on correct network or not connected");
        return;
      }

      if (!switchChain) {
        console.error("switchChain function not available");
        return;
      }

      try {
        console.log("Attempting to switch to Monad Testnet (Chain ID: 10143)...");
        // Attempt to switch to Monad Testnet
        await switchChain({ chainId: monadTestnet.id });
        console.log("Successfully switched to Monad Testnet");
      } catch (error: any) {
        console.error("Switch chain error:", error);
        // If network doesn't exist in MetaMask, prompt to add it
        if (error?.code === 4902 || error?.message?.includes("Unrecognized chain") || error?.message?.includes("does not match")) {
          try {
            console.log("Network not found in wallet, attempting to add Monad Testnet...");
            // Request to add Monad Testnet to MetaMask
            await window.ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${monadTestnet.id.toString(16)}`, // Convert to hex (0x279f)
                  chainName: monadTestnet.name,
                  nativeCurrency: monadTestnet.nativeCurrency,
                  rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                  blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
                },
              ],
            });
            console.log("Successfully added Monad Testnet to wallet");
          } catch (addError) {
            console.error("Failed to add Monad Testnet:", addError);
          }
        } else {
          console.error("Failed to switch network:", error);
        }
      }
    };

    checkAndSwitchNetwork();
  }, [isConnected, chainId, switchChain]);

  return {
    isCorrectNetwork: chainId === monadTestnet.id,
    targetChainId: monadTestnet.id,
    currentChainId: chainId,
  };
}
