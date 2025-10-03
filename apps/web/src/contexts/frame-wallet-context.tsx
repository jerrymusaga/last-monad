"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { metaMask } from "wagmi/connectors";

// Monad Testnet Chain Configuration
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

// Dual wallet configuration: Farcaster MiniApp + MetaMask Smart Accounts
const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    farcasterMiniApp(), // For Farcaster/Warpcast clients
    metaMask({
      dappMetadata: {
        name: "LastMonad",
        url: typeof window !== "undefined" ? window.location.origin : "https://last-monad.vercel.app",
        iconUrl: typeof window !== "undefined" ? `${window.location.origin}/1percent.jpg` : "",
      },
    }), // For web browsers with MetaMask extension
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function FrameWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
