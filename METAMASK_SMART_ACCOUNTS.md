# MetaMask Smart Accounts Integration

This document explains how MetaMask Smart Accounts are integrated into the LastMonad dApp using the MetaMask Delegation Toolkit.

## Overview

LastMonad supports **dual wallet mode**:
1. **Farcaster MiniApp Wallet** - For users accessing via Warpcast/Farcaster clients
2. **MetaMask Smart Accounts** - For users accessing via web browsers

## What are MetaMask Smart Accounts?

MetaMask Smart Accounts are ERC-4337 compatible Smart Contract Wallets that provide:
- **Batch Transactions** - Execute multiple operations in one transaction
- **Gas Sponsorship** - Flexible gas payment options
- **Delegated Permissions** - Rule-based permission sharing
- **Enhanced Security** - Multi-signature approvals

## Architecture

### 1. Wallet Configuration ([frame-wallet-context.tsx](apps/web/src/contexts/frame-wallet-context.tsx))

```typescript
const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    farcasterMiniApp(),     // For Farcaster clients
    metaMask({...}),        // For web browsers with MetaMask
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});
```

### 2. Smart Account Hook ([use-smart-account.ts](apps/web/src/hooks/use-smart-account.ts))

The custom hook uses the MetaMask Delegation Toolkit to convert EOA to Smart Account:

```typescript
import { toMetaMaskSmartAccount, Implementation } from "@metamask/delegation-toolkit";

const account = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [address, [], [], []],
  deploySalt: "0x",
  signer: walletClient,
});
```

**Key Features:**
- Automatically detects MetaMask connector
- Creates Smart Account on-demand
- Falls back to regular EOA for Farcaster
- Provides loading states and error handling

### 3. Connect Button ([connect-button.tsx](apps/web/src/components/connect-button.tsx))

Smart wallet selection UI that:
- **In Farcaster Context**: Auto-connects to Farcaster wallet
- **In Web Browser**: Shows dropdown with connector options
- **When Connected**: Displays Smart Account badge and address

## User Flow

### Web Browser Flow (MetaMask Smart Account)

1. User visits LastMonad dApp in browser
2. Clicks "Connect Wallet"
3. Selects "MetaMask (Smart Account)" from dropdown
4. MetaMask extension prompts for connection
5. Smart Account is created automatically
6. UI shows "🔐 Smart Account" badge
7. User interacts with LastMonad contract via Smart Account

### Farcaster Flow (MiniApp Wallet)

1. User opens LastMonad in Warpcast app
2. Clicks "Connect Wallet"
3. Farcaster wallet connects automatically
4. User interacts with LastMonad contract via EOA

## Environment Detection

```typescript
// Detect Farcaster context
const isFarcasterContext = context !== null;

// Detect MetaMask connector
const isMetaMask = connector?.id === "io.metamask";
```

## Smart Account Features

### 1. Address Display
- Smart Account address is displayed when available
- Falls back to EOA address for other connectors

### 2. Loading States
- Shows "⏳" while creating Smart Account
- Shows "🔐" when Smart Account is ready

### 3. Network Badge
- Always shows "Monad" network indicator
- Works with Monad Testnet (Chain ID: 10143)

## Testing the Integration

### Prerequisites
1. Install MetaMask browser extension
2. Get Monad testnet MON tokens from [faucet](https://faucet.quicknode.com/monad/testnet)
3. Add Monad testnet to MetaMask:
   - Network Name: Monad Testnet
   - RPC URL: https://testnet-rpc.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON
   - Block Explorer: https://testnet.monadexplorer.com

### Testing Steps

1. **Start Development Server**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open in Browser**
   - Navigate to http://localhost:3000
   - Open DevTools console to see Smart Account creation logs

3. **Connect Wallet**
   - Click "Connect Wallet"
   - Select "MetaMask (Smart Account)"
   - Approve connection in MetaMask

4. **Verify Smart Account**
   - Check for "🔐 Smart Account" badge
   - Note the Smart Account address (different from EOA)

5. **Interact with Contract**
   - Stake MON to create pools
   - Join pools
   - Make selections in game
   - All transactions go through Smart Account

## Demo Video Requirements

For qualification, the demo must show:
1. ✅ User opening LastMonad dApp in web browser
2. ✅ Clicking "Connect Wallet" and selecting MetaMask
3. ✅ "🔐 Smart Account" badge appearing after connection
4. ✅ Smart Account address displayed
5. ✅ User interacting with LastMonad contract on Monad testnet
6. ✅ Transactions being executed through the Smart Account

## Implementation Benefits

### For Users
- **No Seed Phrases** - Smart Accounts can be created without complex backup
- **Better UX** - Batch transactions, sponsored gas
- **Enhanced Security** - Multi-sig, delegated permissions

### For Developers
- **Signer Agnostic** - Works with any wallet provider
- **ERC-4337 Compatible** - Standard smart account implementation
- **Easy Integration** - Built on Viem/Wagmi ecosystem

## Technical Details

### Dependencies
```json
{
  "@metamask/delegation-toolkit": "^0.13.0",
  "viem": "^2.27.2",
  "wagmi": "^2.14.12"
}
```

### Chain Configuration
- **Network**: Monad Testnet
- **Chain ID**: 10143
- **RPC**: https://testnet-rpc.monad.xyz
- **Native Token**: MON

### Smart Account Implementation
- **Type**: Hybrid (combining features of multiple implementations)
- **Standard**: ERC-4337 compatible
- **Deployment**: Counterfactual (deployed on first transaction)

## Troubleshooting

### Smart Account Not Creating
- Check MetaMask is installed and connected
- Verify Monad testnet is added to MetaMask
- Check browser console for errors
- Ensure you have testnet MON for gas

### Wrong Address Displayed
- Smart Account address is different from EOA
- This is expected behavior
- Both addresses belong to you

### Farcaster Not Working
- Farcaster uses separate wallet system
- Smart Accounts only work in web browser
- This is by design for dual-wallet support

## Resources

- [MetaMask Delegation Toolkit Docs](https://docs.metamask.io/delegation-toolkit)
- [Monad Testnet Docs](https://docs.monad.xyz)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Viem Account Abstraction](https://viem.sh/account-abstraction)

## License

MIT
