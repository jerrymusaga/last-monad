"use client"

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useMiniApp } from '@/contexts/miniapp-context'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { useNetworkCheck } from '@/hooks/use-network-check'

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { context } = useMiniApp()
  const {
    smartAccountAddress,
    isSmartAccountLoading,
    isMetaMask,
    isFarcaster,
    isSmartAccountReady
  } = useSmartAccount()

  const { isCorrectNetwork } = useNetworkCheck()

  // Detect if in Farcaster context
  const isFarcasterContext = context !== null

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-connect Farcaster wallet when in Farcaster context
  useEffect(() => {
    if (mounted && !isConnected && isFarcasterContext) {
      const frameConnector = connectors.find(connector => connector.id === 'frameWallet')
      if (frameConnector) {
        connect({ connector: frameConnector })
      }
    }
  }, [mounted, isConnected, isFarcasterContext, connectors, connect])

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
        Connect Wallet
      </button>
    )
  }

  if (!isConnected) {
    // In Farcaster: Only show Farcaster wallet
    if (isFarcasterContext) {
      const frameConnector = connectors.find(connector => connector.id === 'frameWallet')
      return (
        <button
          onClick={() => frameConnector && connect({ connector: frameConnector })}
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Connect Wallet
        </button>
      )
    }

    // In Web: Show all available connectors
    return (
      <div className="relative">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Connect Wallet
        </button>

        {showConnectors && (
          <div className="absolute top-full mt-2 right-0 bg-background border rounded-md shadow-lg p-2 min-w-[200px] z-50">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector })
                  setShowConnectors(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-accent rounded-md text-sm"
              >
                {connector.name}
                {connector.id === 'io.metamask' && ' (Smart Account)'}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Display Smart Account address if available, otherwise EOA
  const displayAddress = isMetaMask && smartAccountAddress ? smartAccountAddress : address

  return (
    <div className="flex items-center gap-2">
      {/* Network badge - shows warning if wrong network */}
      <button
        type="button"
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-10 px-3 py-2 ${
          !isCorrectNetwork
            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
            : "bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
        title={!isCorrectNetwork ? "⚠️ Please switch to Monad Testnet" : "Connected to Monad Testnet"}
      >
        {!isCorrectNetwork ? "⚠️ Wrong Network" : "Monad"}
      </button>

      {/* Smart Account indicator */}
      {isMetaMask && (
        <button
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors border border-input bg-blue-50 text-blue-700 h-10 px-3 py-2"
          title={isSmartAccountLoading ? "Creating Smart Account..." : "MetaMask Smart Account"}
        >
          {isSmartAccountLoading ? "⏳" : "🔐"} Smart Account
        </button>
      )}

      {/* Address / Disconnect button */}
      <button
        onClick={() => disconnect()}
        type="button"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        {displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : 'Connected'}
      </button>
    </div>
  )
}
