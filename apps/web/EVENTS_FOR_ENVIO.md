# LastMonad Contract Events for Envio Indexing

This document lists all 12 events from the LastMonad smart contract that should be indexed by Envio.

## Events Overview

### 1. **PoolCreated** ✅
Emitted when a new pool is created.

**Indexed Fields:**
- `poolId` (uint256)
- `creator` (address)

**Data Fields:**
- `entryFee` (uint256)
- `maxPlayers` (uint256)

**Use Cases:**
- Display all created pools
- Filter pools by creator
- Track pool creation activity

---

### 2. **PlayerJoined** ✅
Emitted when a player joins a pool.

**Indexed Fields:**
- `poolId` (uint256)
- `player` (address)

**Data Fields:**
- `currentPlayers` (uint256)
- `maxPlayers` (uint256)

**Use Cases:**
- Track pool fill status
- Get list of players in a pool
- Monitor pool activity

---

### 3. **PoolActivated** ✅
Emitted when a pool becomes active and game starts.

**Indexed Fields:**
- `poolId` (uint256)

**Data Fields:**
- `totalPlayers` (uint256)
- `prizePool` (uint256)

**Use Cases:**
- Notify players game has started
- Display active games
- Track prize pool sizes

---

### 4. **PlayerMadeChoice** ✅
Emitted when a player makes a HEADS/TAILS choice.

**Indexed Fields:**
- `poolId` (uint256)
- `player` (address)

**Data Fields:**
- `choice` (uint8) - 1=HEADS, 2=TAILS
- `round` (uint256)

**Use Cases:**
- Track player choices per round
- Monitor round participation
- Display who has chosen

---

### 5. **RoundResolved** ⚡ CRITICAL
Emitted when a round completes and minority wins.

**Indexed Fields:**
- `poolId` (uint256)

**Data Fields:**
- `round` (uint256)
- `winningChoice` (uint8) - 1=HEADS, 2=TAILS
- `eliminatedCount` (uint256)
- `remainingCount` (uint256)

**Use Cases:**
- Display round results
- Show elimination history
- Track game progression
- Update UI with eliminated players

---

### 6. **RoundRepeated** ✅
Emitted when all players choose the same option (unanimous).

**Indexed Fields:**
- `poolId` (uint256)

**Data Fields:**
- `round` (uint256)
- `unanimousChoice` (uint8) - 1=HEADS, 2=TAILS
- `playerCount` (uint256)

**Use Cases:**
- Notify players of round repeat
- Display unanimous choice events
- Track game dynamics

---

### 7. **GameCompleted** ✅
Emitted when a game finishes with a winner.

**Indexed Fields:**
- `poolId` (uint256)
- `winner` (address)

**Data Fields:**
- `prizeAmount` (uint256)

**Use Cases:**
- Display winners
- Track completed games
- Show leaderboard
- Calculate total prizes won

---

### 8. **PoolAbandoned** ✅
Emitted when a creator unstakes early and abandons pools.

**Indexed Fields:**
- `poolId` (uint256)
- `creator` (address)

**Data Fields:**
- `refundAmount` (uint256)

**Use Cases:**
- Notify players of abandoned pools
- Track refund amounts
- Display pool status changes

---

### 9. **StakeDeposited** ✅
Emitted when a creator stakes MON.

**Indexed Fields:**
- `creator` (address)

**Data Fields:**
- `amount` (uint256)
- `poolsEligible` (uint256)

**Use Cases:**
- Track creator stakes
- Display staking activity
- Show pools eligible per creator

---

### 10. **StakeWithdrawn** ✅
Emitted when a creator unstakes.

**Indexed Fields:**
- `creator` (address)

**Data Fields:**
- `amount` (uint256)
- `penalty` (uint256)

**Use Cases:**
- Track unstaking activity
- Display penalties
- Monitor creator behavior

---

### 11. **CreatorRewardClaimed** ✅
Emitted when creator claims their 12% royalties.

**Indexed Fields:**
- `creator` (address)

**Data Fields:**
- `amount` (uint256)

**Use Cases:**
- Track creator earnings
- Display total rewards claimed
- Show creator dashboard stats

---

### 12. **ProjectPoolUpdated** ✅
Emitted when the project pool changes (penalties, abandoned fees).

**Data Fields:**
- `amount` (uint256)
- `source` (string) - Description of update
- `totalPool` (uint256)

**Use Cases:**
- Track protocol revenue
- Monitor project pool balance
- Display platform statistics

---

## Event Priority for Indexing

### High Priority (Real-time UI updates):
1. **RoundResolved** - Game state changes
2. **PlayerJoined** - Pool filling
3. **GameCompleted** - Winners
4. **PoolActivated** - Game starts

### Medium Priority (Activity tracking):
5. **PlayerMadeChoice** - Round participation
6. **PoolCreated** - New pools
7. **StakeDeposited** - New creators

### Low Priority (Analytics):
8. **RoundRepeated** - Edge cases
9. **PoolAbandoned** - Rare events
10. **StakeWithdrawn** - Creator exits
11. **CreatorRewardClaimed** - Payouts
12. **ProjectPoolUpdated** - Platform metrics

---

## Recommended Envio Queries

### Get Active Pools
```graphql
{
  poolCreated(where: { status: ACTIVE }) {
    poolId
    creator
    entryFee
    maxPlayers
    currentPlayers
  }
}
```

### Get Game Progress
```graphql
{
  roundResolved(where: { poolId: $poolId }, orderBy: round, orderDirection: asc) {
    round
    winningChoice
    eliminatedCount
    remainingCount
  }
}
```

### Get Player History
```graphql
{
  playerJoined(where: { player: $address }) {
    poolId
    currentPlayers
    maxPlayers
  }

  gameCompleted(where: { winner: $address }) {
    poolId
    prizeAmount
  }
}
```

### Get Creator Stats
```graphql
{
  stakeDeposited(where: { creator: $address }) {
    amount
    poolsEligible
  }

  creatorRewardClaimed(where: { creator: $address }) {
    amount
  }
}
```

---

## All Events Are Available in:

1. **ABI:** `/apps/web/src/contracts/lastMonadABI.ts`
2. **Hooks:** `/apps/web/src/hooks/use-last-monad.ts`

All event watchers follow the pattern: `useWatch[EventName]((log) => { ... })`
