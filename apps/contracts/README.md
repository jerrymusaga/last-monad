# LastMonad Smart Contracts

Smart contracts for the LastMonad multiplayer blockchain elimination game on Monad testnet.

## Contract Overview

- **LastMonad.sol**: Main game contract implementing pool creation, player joins, coin toss mechanics, and prize distribution.

## Setup

1. Install Foundry if you haven't already:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Install dependencies:
   ```bash
   forge install
   ```

3. Create a `.env` file in the `apps/contracts` directory:
   ```bash
   PRIVATE_KEY=your_private_key_here
   MONAD_ETHERSCAN_API_KEY=your_etherscan_key_here (optional)
   ```

## Testing

Run all tests:
```bash
forge test
```

Run tests with verbosity:
```bash
forge test -vvv
```

Run specific test:
```bash
forge test --match-test test_StakeForPoolCreation_Success
```

## Deployment

### Deploy to Monad Testnet

```bash
forge script script/DeployLastMonad.s.sol:DeployLastMonad \
  --rpc-url monad_testnet \
  --broadcast \
  --verify
```

### Get Monad Testnet Tokens

1. Visit the [Monad Testnet Faucet](https://faucet.quicknode.com/monad/testnet)
2. Enter your wallet address
3. Claim testnet MON tokens

## Contract Constants

- **BASE_STAKE**: 2 MON - Minimum stake required to create pools
- **MAX_STAKE_ALLOWED**: 200 MON - Maximum stake allowed
- **POOL_MULTIPLIER**: 100 (1:1 ratio) - Every 2 MON staked = 1 pool
- **PENALTY_PERCENTAGE**: 30% - Penalty for early unstaking
- **CREATOR_REWARD_PERCENTAGE**: 12% - Creator's reward from completed pools

## Network Information

- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Block Explorer**: https://testnet.monadexplorer.com
- **Native Token**: MON

## Game Mechanics

1. **Staking**: Creators stake MON tokens to create pools (2 MON = 1 pool)
2. **Pool Creation**: Creators define entry fee and max players
3. **Joining**: Players join by paying the entry fee
4. **Gameplay**: Players choose HEADS or TAILS each round, minority wins
5. **Elimination**: Majority players are eliminated each round
6. **Prize Distribution**: Winner gets 88%, creator gets 12%

## License

MIT
