"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { toMetaMaskSmartAccount, Implementation } from "@metamask/delegation-toolkit";
import type { SmartAccount } from "viem/account-abstraction";

export function useSmartAccount() {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [isSmartAccountLoading, setIsSmartAccountLoading] = useState(false);
  const [smartAccountError, setSmartAccountError] = useState<Error | null>(null);

  // Check if using MetaMask connector (not Farcaster)
  const isMetaMask = connector?.id === "io.metamask" || connector?.id === "metaMask";
  const isFarcaster = connector?.id === "frameWallet";

  useEffect(() => {
    // Only create smart account for MetaMask connector
    if (!isConnected || !address || !walletClient || !publicClient || !isMetaMask) {
      setSmartAccount(null);
      return;
    }

    const createSmartAccount = async () => {
      try {
        setIsSmartAccountLoading(true);
        setSmartAccountError(null);

        // Create MetaMask Smart Account using Delegation Toolkit
        const account = await toMetaMaskSmartAccount({
          client: publicClient,
          implementation: Implementation.Hybrid,
          deployParams: [address, [], [], []], // owner, initialExecutors, initialHooks, initialExecutionPolicies
          deploySalt: "0x", // Use default salt
          signer: walletClient,
        });

        setSmartAccount(account);
      } catch (error) {
        console.error("Failed to create smart account:", error);
        setSmartAccountError(error as Error);
        setSmartAccount(null);
      } finally {
        setIsSmartAccountLoading(false);
      }
    };

    createSmartAccount();
  }, [isConnected, address, walletClient, publicClient, isMetaMask]);

  return {
    smartAccount,
    smartAccountAddress: smartAccount?.address,
    isSmartAccountLoading,
    smartAccountError,
    isMetaMask,
    isFarcaster,
    // Helper to check if smart account is ready
    isSmartAccountReady: isMetaMask && isConnected && !!smartAccount && !isSmartAccountLoading,
  };
}
