"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/contexts/frame-wallet-context";

/**
 * Network warning banner that shows when user is on wrong network
 */
export function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  if (!isWrongNetwork) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    if (!switchChain) return;

    try {
      await switchChain({ chainId: monadTestnet.id });
    } catch (error: any) {
      // If network doesn't exist, try to add it
      if (error?.code === 4902 || error?.message?.includes("Unrecognized chain")) {
        try {
          await window.ethereum?.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${monadTestnet.id.toString(16)}`,
                chainName: monadTestnet.name,
                nativeCurrency: monadTestnet.nativeCurrency,
                rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
              },
            ],
          });
          // Try switching again
          await switchChain({ chainId: monadTestnet.id });
        } catch (addError) {
          console.error("Failed to add Monad Testnet:", addError);
        }
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold">Wrong Network Detected</p>
            <p className="text-sm opacity-90">
              Please switch to Monad Testnet to use this app
            </p>
          </div>
        </div>
        <button
          onClick={handleSwitchNetwork}
          disabled={isPending}
          className="bg-white text-red-600 hover:bg-gray-100 disabled:bg-gray-300 px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap"
        >
          {isPending ? "Switching..." : "Switch to Monad Testnet"}
        </button>
      </div>
    </div>
  );
}
