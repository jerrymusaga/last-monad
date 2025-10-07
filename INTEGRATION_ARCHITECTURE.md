# LastMonad: Smart Contract Integration & Event Indexing Architecture

## Overview
This document outlines the architecture for integrating LastMonad smart contract with frontend using **wagmi v2** for direct contract interactions and **Envio** for event indexing and historical data.

---

## Architecture Strategy

### **Hybrid Approach: wagmi + Envio**

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   WAGMI v2       │              │   ENVIO GraphQL  │     │
│  │                  │              │                  │     │
│  │ • Write Actions  │              │ • Read Queries   │     │
│  │ • Real-time      │              │ • Historical     │     │
│  │ • User Txns      │              │ • Aggregations   │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
│           │                                 │               │
└───────────┼─────────────────────────────────┼───────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────┐              ┌──────────────────┐
│   RPC Provider    │              │  Envio Indexer   │
│  (Monad Testnet)  │◄─────────────┤                  │
└───────────────────┘              └──────────────────┘
            │
            ▼
┌───────────────────────────────────────────────┐
│        LastMonad Smart Contract               │
│         (Deployed on Monad Testnet)           │
└───────────────────────────────────────────────┘
```

---

## Responsibilities Split

### **WAGMI v2 - Real-time Contract Interactions**

✅ **Use wagmi for:**
1. **Write Operations** (User actions):
   - Stake MON
   - Create Pool
   - Join Pool
   - Make Selection (HEADS/TAILS)
   - Claim Prize
   - Unstake

2. **User-Specific Reads** (Current state):
   - Get user's creator info
   - Check if user staked
   - Get user's choice in current round
   - Check if user eliminated

3. **Real-time Event Watching** (Live updates):
   - Pool gets full → activate
   - Round resolved → update UI
   - Player joined → update count
   - Game completed → show winner

**Why wagmi?**
- Direct RPC calls (fast)
- Optimistic updates
- Transaction management
- Wallet integration
- Real-time subscriptions

---

### **Envio - Historical Data & Complex Queries**

✅ **Use Envio for:**
1. **Historical Data** (Past events):
   - All pools ever created
   - Round history for a game
   - Player's game history
   - Creator earnings history

2. **Aggregations** (Analytics):
   - Total MON staked across platform
   - Total games completed
   - Average pool size
   - Top creators by earnings
   - Platform statistics

3. **Complex Queries** (Multi-event relationships):
   - Get pool with all rounds + players
   - Creator's all pools with completion status
   - Player's win/loss record
   - Leaderboards

4. **List Pages** (Paginated data):
   - Browse all pools (with filters)
   - Search pools by creator
   - Active games list
   - Completed games archive

**Why Envio?**
- Fast GraphQL queries
- Indexed historical data
- Complex filtering/sorting
- Pagination support
- No RPC rate limits
- Cached data

---

## Implementation Plan

### **Phase 1: Contract Deployment** (Infrastructure)

```bash
# 1. Deploy LastMonad contract to Monad Testnet
cd apps/contracts
forge script script/DeployLastMonad.s.sol --rpc-url monad_testnet --broadcast

# 2. Update contract address in frontend
# apps/web/src/contracts/config.ts
export const LAST_MONAD_ADDRESS = "0x..." // deployed address
```

**Deliverables:**
- ✅ Deployed contract address
- ✅ Verified on Monad Explorer
- ✅ ABI exported to frontend

---

### **Phase 2: Envio Setup** (Indexing)

```bash
# 1. Initialize Envio project
cd apps
npx envio init indexer

# 2. Configure config.yaml
networks:
  - id: 10143
    name: monad-testnet
    rpc_url: https://testnet-rpc.monad.xyz
    start_block: <deployment_block>

contracts:
  - name: LastMonad
    address: 0x... # deployed address
    abi_file_path: ./abis/LastMonad.json
    events:
      - PoolCreated
      - PlayerJoined
      - PoolActivated
      - PlayerMadeChoice
      - RoundResolved
      - RoundRepeated
      - GameCompleted
      - PoolAbandoned
      - StakeDeposited
      - StakeWithdrawn
      - CreatorRewardClaimed
      - ProjectPoolUpdated

# 3. Generate GraphQL schema
npx envio codegen

# 4. Deploy indexer
npx envio dev
```

**Deliverables:**
- ✅ Envio indexer running
- ✅ GraphQL endpoint available
- ✅ Historical events indexed

---

### **Phase 3: Frontend Integration** (Hooks & Queries)

#### **A. Create Envio Client**

```typescript
// apps/web/src/lib/envio-client.ts
import { GraphQLClient } from 'graphql-request';

export const envioClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_ENVIO_URL || 'http://localhost:8080/graphql'
);
```

#### **B. Create Envio Hooks**

```typescript
// apps/web/src/hooks/use-envio-pools.ts

import { useQuery } from '@tanstack/react-query';
import { envioClient } from '@/lib/envio-client';
import { gql } from 'graphql-request';

// Get all pools with filters
export function useEnvioPools(filters?: {
  status?: 'OPENED' | 'ACTIVE' | 'COMPLETED';
  creator?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['envio-pools', filters],
    queryFn: async () => {
      const query = gql`
        query GetPools($status: PoolStatus, $creator: String, $limit: Int) {
          poolCreated(
            where: { status: $status, creator: $creator }
            limit: $limit
            orderBy: createdAt
            orderDirection: desc
          ) {
            poolId
            creator
            entryFee
            maxPlayers
            timestamp
            poolActivated {
              totalPlayers
              prizePool
            }
            gameCompleted {
              winner
              prizeAmount
            }
          }
        }
      `;
      return envioClient.request(query, filters);
    },
  });
}

// Get game history (all rounds)
export function useEnvioGameHistory(poolId: string) {
  return useQuery({
    queryKey: ['envio-game-history', poolId],
    queryFn: async () => {
      const query = gql`
        query GetGameHistory($poolId: String!) {
          roundResolved(
            where: { poolId: $poolId }
            orderBy: round
            orderDirection: asc
          ) {
            round
            winningChoice
            eliminatedCount
            remainingCount
            timestamp
          }

          roundRepeated(
            where: { poolId: $poolId }
            orderBy: round
            orderDirection: asc
          ) {
            round
            unanimousChoice
            playerCount
            timestamp
          }
        }
      `;
      return envioClient.request(query, { poolId });
    },
  });
}

// Get player stats
export function useEnvioPlayerStats(address: string) {
  return useQuery({
    queryKey: ['envio-player-stats', address],
    queryFn: async () => {
      const query = gql`
        query GetPlayerStats($address: String!) {
          playerJoined(where: { player: $address }) {
            poolId
            timestamp
          }

          gameCompleted(where: { winner: $address }) {
            poolId
            prizeAmount
            timestamp
          }
        }
      `;
      return envioClient.request(query, { address });
    },
  });
}

// Get creator earnings
export function useEnvioCreatorStats(address: string) {
  return useQuery({
    queryKey: ['envio-creator-stats', address],
    queryFn: async () => {
      const query = gql`
        query GetCreatorStats($address: String!) {
          poolCreated(where: { creator: $address }) {
            poolId
            entryFee
            maxPlayers
          }

          creatorRewardClaimed(where: { creator: $address }) {
            amount
            timestamp
          }

          stakeDeposited(where: { creator: $address }) {
            amount
            poolsEligible
            timestamp
          }
        }
      `;
      return envioClient.request(query, { address });
    },
  });
}
```

---

### **Phase 4: Page-by-Page Implementation**

#### **Pattern: Hybrid Data Fetching**

Each page uses **both** wagmi (real-time) and Envio (historical):

```typescript
// Example: Pool Detail Page
export default function PoolDetailPage({ poolId }) {
  // WAGMI - Real-time contract state
  const { poolInfo, refetch } = usePoolInfo(BigInt(poolId));
  const { remainingPlayers } = useRemainingPlayers(BigInt(poolId));
  const { currentRound } = useCurrentRound(BigInt(poolId));

  // ENVIO - Historical data
  const { data: gameHistory } = useEnvioGameHistory(poolId);
  const { data: allPlayers } = useEnvioPoolPlayers(poolId);

  // WAGMI - Real-time event watching
  useWatchRoundResolved((log) => {
    if (log.args.poolId === poolId) {
      refetch(); // Refresh contract state
      queryClient.invalidateQueries(['envio-game-history']); // Refresh Envio
    }
  });

  return (
    <div>
      {/* Current state from wagmi */}
      <h1>Round {currentRound}</h1>
      <p>Players: {remainingPlayers.length}</p>

      {/* Historical data from Envio */}
      <RoundHistory rounds={gameHistory?.roundResolved} />
      <PlayerList players={allPlayers} />
    </div>
  );
}
```

---

### **Phase 5: Page Implementations**

#### **1. Stake Page** (`/stake`)
- **Wagmi**: `useCreatorInfo()`, `useStakeForPoolCreation()`
- **Envio**: Creator's historical stakes
- **Pattern**: Write with wagmi, show history with Envio

#### **2. Create Pool Page** (`/create-pool`)
- **Wagmi**: `useCreatePool()`, check `poolsRemaining`
- **Envio**: Show creator's past pools
- **Pattern**: Write with wagmi, validate with contract state

#### **3. Pools Page** (`/pools`)
- **Wagmi**: Watch `PoolCreated` events (real-time)
- **Envio**: List all pools with filters/pagination
- **Pattern**: Primary data from Envio, live updates from wagmi

#### **4. Pool Detail** (`/pools/[id]`)
- **Wagmi**: Current game state, join pool, activate
- **Envio**: Round history, player list, stats
- **Pattern**: Hybrid - real-time + historical

#### **5. Game Page** (`/game/[id]`)
- **Wagmi**: `useMakeSelection()`, current round state
- **Envio**: Past rounds, eliminated players
- **Pattern**: Real-time gameplay with wagmi, history with Envio
- **Critical**: Watch `RoundResolved` for UI updates

#### **6. Dashboard** (`/dashboard`)
- **Wagmi**: User's current stake status
- **Envio**: All user's pools, earnings, stats
- **Pattern**: Overview from Envio, actions with wagmi

#### **7. Unstake Page** (`/unstake`)
- **Wagmi**: `useUnstakeAndClaim()`, check completion
- **Envio**: Show penalty calculations, pool statuses
- **Pattern**: Write with wagmi, display data from Envio

---

## Data Flow Examples

### **Example 1: Creating a Pool**

```typescript
// 1. User clicks "Create Pool"
const { createPool, isSuccess } = useCreatePool();

// 2. Submit transaction via wagmi
createPool(entryFee, maxPlayers);

// 3. Wait for confirmation
if (isSuccess) {
  // 4. Envio will index PoolCreated event (5-10 seconds)
  // 5. Redirect to pool detail page
  router.push(`/pools/${newPoolId}`);

  // 6. Pool detail page fetches from Envio
  // (May use optimistic update while waiting)
}
```

### **Example 2: Browsing Pools**

```typescript
// 1. Load pools from Envio (fast, cached)
const { data: pools } = useEnvioPools({
  status: 'OPENED',
  limit: 20
});

// 2. Display list with Envio data
pools.map(pool => <PoolCard pool={pool} />)

// 3. Watch for new pools via wagmi
useWatchPoolCreated((log) => {
  // 4. Invalidate query to refetch from Envio
  queryClient.invalidateQueries(['envio-pools']);
});
```

### **Example 3: Playing a Game Round**

```typescript
// 1. Show current round state (wagmi)
const { currentRound } = useCurrentRound(poolId);

// 2. Player makes choice (wagmi write)
const { makeSelection } = useMakeSelection();
makeSelection(poolId, PlayerChoice.HEADS);

// 3. Watch for round resolution (wagmi event)
useWatchRoundResolved((log) => {
  if (log.args.poolId === poolId) {
    // 4. Update UI immediately
    refetchGameState();

    // 5. Invalidate Envio cache for history
    invalidateQueries(['envio-game-history']);
  }
});

// 6. Display round history (Envio)
const { data: history } = useEnvioGameHistory(poolId);
```

---

## Benefits of This Architecture

### ✅ **Performance**
- Fast reads from Envio (indexed, cached)
- Real-time updates from wagmi events
- No excessive RPC calls

### ✅ **User Experience**
- Instant feedback (wagmi)
- Rich historical data (Envio)
- Optimistic UI updates

### ✅ **Scalability**
- Envio handles pagination
- Complex queries don't hit RPC
- Reduced blockchain load

### ✅ **Reliability**
- Envio backup for data
- Multiple data sources
- Graceful degradation

---

## Migration Path

### **Phase 1: MVP (wagmi only)**
- Get basic functionality working
- All data from contract calls
- Simple, but slower

### **Phase 2: Add Envio (hybrid)**
- Integrate Envio for lists
- Keep wagmi for writes
- Best of both worlds

### **Phase 3: Optimize**
- Cache strategies
- Optimistic updates
- Real-time subscriptions

---

## Next Steps

1. **Deploy Contract** to Monad Testnet
2. **Setup Envio Indexer** with config
3. **Create Envio Hooks** for each data type
4. **Update Pages** to use hybrid approach
5. **Add Real-time Updates** with event watchers
6. **Test End-to-End** on testnet

---

## Questions to Consider

1. **Caching Strategy**: How long to cache Envio data?
2. **Optimistic Updates**: Show pending txns before confirmation?
3. **Error Handling**: Fallback if Envio is down?
4. **Real-time**: Use Envio subscriptions or wagmi events?
5. **Pagination**: How many pools per page?

---

This architecture gives us the best of both worlds: **wagmi for real-time interactions** and **Envio for powerful queries**! 🚀
