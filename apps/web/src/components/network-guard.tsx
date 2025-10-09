"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { monadTestnet } from "@/contexts/frame-wallet-context";

/**
 * Global network guard that ensures users are always on Monad Testnet
 * when connected. Automatically switches network on connection.
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const ensureCorrectNetwork = async () => {
      // Only check if connected and not already on Monad Testnet
      if (!isConnected || chainId === monadTestnet.id) {
        return;
      }

      if (!switchChain) {
        console.warn("switchChain function not available");
        return;
      }

      try {
        console.log(`[NetworkGuard] Wrong network detected (Chain ID: ${chainId}), switching to Monad Testnet...`);
        await switchChain({ chainId: monadTestnet.id });
        console.log("[NetworkGuard] Successfully switched to Monad Testnet");
      } catch (error: any) {
        console.error("[NetworkGuard] Switch chain error:", error);

        // If network doesn't exist in wallet, try to add it
        if (error?.code === 4902 || error?.message?.includes("Unrecognized chain")) {
          try {
            console.log("[NetworkGuard] Network not found, adding Monad Testnet to wallet...");
            await window.ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${monadTestnet.id.toString(16)}`, // 0x279f
                  chainName: monadTestnet.name,
                  nativeCurrency: monadTestnet.nativeCurrency,
                  rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                  blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
                },
              ],
            });
            console.log("[NetworkGuard] Successfully added Monad Testnet");

            // Try switching again after adding
            await switchChain({ chainId: monadTestnet.id });
          } catch (addError) {
            console.error("[NetworkGuard] Failed to add/switch to Monad Testnet:", addError);
          }
        }
      }
    };

    ensureCorrectNetwork();
  }, [isConnected, chainId, switchChain]);

  return <>{children}</>;
}
