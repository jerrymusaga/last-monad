## LastMonad — Minority-Wins On‑Chain Elimination Game

![Last Monad Logo](apps/web/public/last-monad-logo.png)

### Tagline
- Multiplayer blockchain elimination game where the minority wins

### TL;DR
- **Players** join a pool, pick HEADS or TAILS each round, and **survive by being in the minority**.
- **Creators** stake MON to create pools and **earn 12% of the prize** when their pools finish.
- Built on **Monad Testnet**, with hybrid data: **wagmi** for real-time writes + **Envio** indexer for fast, historical reads.
- Smooth UX across **Farcaster Miniapps** and **MetaMask Smart Accounts**.

---

## Problem
- **On-chain games** are either slow or lack rich historical data and discovery.
- **Creators** have weak monetization and poor incentives to bootstrap activity.
- **Players** need transparent, verifiable outcomes with responsive UX.

## Solution
- A fast, verifiable, minority-wins game on Monad with:
  - **Provable state** and transparent rules on-chain
  - **Real-time UX** via wagmi events + **indexed history** via Envio GraphQL
  - **Creator economics**: stake to create pools, earn **12%** on completion; platform accrues penalties
  - **Dual-wallet access**: Farcaster Miniapp wallets and MetaMask Smart Accounts

---

## Product Overview
- **Pool lifecycle**: Stake → Create Pool → Players Join → Rounds → Winner Claims → Creator Claims
- **Gameplay**: Each round, players choose HEADS/TAILS. Majority is eliminated; **minority advances**. Unanimous choice → round repeats.
- **Completion**: One remaining player wins and claims the prize; creator claims reward.

### Player Flow
1. Browse pools and join by paying entry fee
2. Make a choice each round (HEADS/TAILS)
3. Survive to win and claim the prize

### Creator Flow
1. Stake MON to unlock pool creation capacity
2. Create pools with chosen entry fee and max players
3. Earn **12%** of prize pool on completion; can later **unstake** (with conditions)

---

## Why Now
- **Monad** provides high throughput, low-latency EVM-style execution ideal for rapid game loops.
- **Envio** indexers enable rich, filterable queries for discovery and analytics.
- **Farcaster Miniapps** and **Smart Accounts** are maturing, reducing onboarding friction.

---

## Architecture (Hybrid: wagmi + Envio)
```
Frontend (Next.js, TypeScript)
  ├─ wagmi/viem (writes, real-time event watching)
  ├─ Envio GraphQL (historical & aggregated reads)
  └─ Wallets: Farcaster Miniapp + MetaMask Smart Accounts
         │
         ▼
   Monad Testnet RPC  ◄────────── Envio Indexer
         │                         (events → Postgres → GraphQL)
         ▼
  LastMonad Smart Contract
```

- **Frontend**: Next.js 14, Tailwind, shadcn/ui
- **Smart contract**: Solidity, OpenZeppelin, ReentrancyGuard
- **Indexing**: Envio (`apps/indexer`) with raw events + aggregated entities (Pool, Player, Round, Creator, GlobalStats)
- **Wallets**: Farcaster Miniapp connector, MetaMask Delegation Toolkit (Smart Accounts)

Key reference:
- `INTEGRATION_ARCHITECTURE.md`

---

## Smart Contract Highlights
- File: `apps/contracts/src/LastMonad.sol`
- Core concepts:
  - `Pool` struct with lifecycle: OPENED → ACTIVE → COMPLETED/ABANDONED
  - Minority wins each round; tie resolved via `prevrandao` entropy
  - `stakeForPoolCreation()` → creator capacity; **12%** creator reward on completion
  - Early **unstake penalty (30%)** goes to `projectPool` (platform revenue)
  - Secure flows with `nonReentrant`; selective `onlyOwner` controls
- Events (indexed): `PoolCreated`, `PlayerJoined`, `PoolActivated`, `PlayerMadeChoice`, `RoundResolved`, `RoundRepeated`, `GameCompleted`, `PoolAbandoned`, `StakeDeposited`, `StakeWithdrawn`, `CreatorRewardClaimed`, `WinnerPrizeClaimed`, `ProjectPoolUpdated`

---

## Data & Indexing (Envio)
- Project: `apps/indexer` with `schema.graphql` defining:
  - **Raw events**: one-to-one with contract
  - **Aggregated entities**: `Pool`, `Player`, `Round`, `Creator`, `GlobalStats`
- GraphQL reads power:
  - Pool lists and filters, game history, leaderboards, creator stats, global metrics
- Frontend hooks under `apps/web/src/hooks/envio/*` provide typed queries and polling

---

## Wallets & UX
- **Farcaster Miniapp**: frictionless auth in Warpcast clients; account association manifest supported
  - Docs: `FARCASTER_SETUP.md`
- **MetaMask Smart Accounts**: ERC‑4337-compatible smart wallet via Delegation Toolkit
  - Docs: `METAMASK_SMART_ACCOUNTS.md`
- **Hybrid UX**: instant feedback via wagmi events + indexed, cacheable queries via Envio

---

## Business Model & Token Flows
- **Creator earnings**: 12% of prize pool on pool completion
- **Platform revenue**: `projectPool` accrues from early unstake penalties and abandoned fees; owner can withdraw
- **Player incentives**: transparent rules, minority advantage mechanics, escalating stakes across rounds

---

## Distribution & GTM
- **Farcaster**: Launch as a Miniapp; discovery via casts, channels, and shareable game links
- **Creators program**: Incentivize pool creators with featured slots and bonus rewards
- **Tournaments & seasons**: Themed events to drive repeat play and social sharing
- **Partnerships**: Work with Monad ecosystem dApps, wallets, and infra providers

---

## Competitive Landscape
- On-chain casual games, prediction markets, and social casinos
- Differentiators:
  - **Minority-wins mechanic** with fast on-chain rounds
  - **Creator-led supply** with direct monetization and capacity via staking
  - **Hybrid data plane** (wagmi + Envio) for both speed and depth
  - **Dual wallet support** for web and Farcaster contexts

---

## Roadmap
- Short-term
  - Complete wagmi writes on `stake`, `create-pool`, `game` pages
  - Finalize Envio-powered `game/[id]` page with real data
  - Add leaderboards and creator dashboards
- Mid-term
  - On-chain RNG hardening (e.g., VRF module for tie-breaks)
  - Dynamic pool templates (themes, variable round rules)
  - Mobile-first UX polish for Miniapp
- Long-term
  - Seasonal tournaments, sponsorships, and social integrations
  - Governance of projectPool allocations

References:
- `FRONTEND_INTEGRATION_COMPLETE.md` (current status and next steps)

---

## Current Status / Traction
- Monorepo (Turborepo) with apps:
  - `apps/web` (Next.js frontend) — Envio reads integrated; live pools page
  - `apps/contracts` (Solidity) — LastMonad contract implemented
  - `apps/indexer` (Envio) — Configured, handlers and schema in place
- Deployment: Monad Testnet
  - Frontend address/contract config at `apps/web/src/contracts/config.ts`
  - Indexer config at `apps/indexer/config.yaml`
- Public assets: `apps/web/public/*` (logo, icons)

---

## The Ask (example placeholders)
- Raise: TBD (pre-seed/seed)
- Use of funds: Security review, prize liquidity, GTM partnerships, ecosystem growth
- Support needed: Access to distribution, introductions to creators and wallets

---

## Appendix A — Key Links (Repo)
- Overview: `README.md`
- Architecture: `INTEGRATION_ARCHITECTURE.md`
- Envio Setup: `apps/indexer/ENVIO_SETUP_SUMMARY.md`
- Frontend Integration: `FRONTEND_INTEGRATION_COMPLETE.md`
- Farcaster: `FARCASTER_SETUP.md`
- Smart Accounts: `METAMASK_SMART_ACCOUNTS.md`
- Contract ABI: `apps/web/src/contracts/lastMonadABI.ts`

## Appendix B — Sample Queries (Envio)
```graphql
# Pools with latest first
query GetPools($limit: Int = 20) {
  Pool(limit: $limit, order_by: {createdAt: desc}) {
    id
    poolId
    creator
    entryFee
    maxPlayers
    currentPlayers
    prizePool
    status
    createdAt
  }
}
```

```graphql
# Game history by pool
query GetGameHistory($poolId: String!) {
  Round(where: {poolId: {_eq: $poolId}}, order_by: {round: asc}) {
    round
    winningChoice
    eliminatedCount
    remainingCount
    isRepeated
    timestamp
  }
  Player(where: {poolId: {_eq: $poolId}}) {
    player
    joinedAt
    isEliminated
    eliminatedInRound
  }
}
```

## Appendix C — Contract Events (Selection)
- PoolCreated(poolId, creator, entryFee, maxPlayers)
- PlayerJoined(poolId, player, currentPlayers, maxPlayers)
- PoolActivated(poolId, totalPlayers, prizePool)
- PlayerMadeChoice(poolId, player, choice, round)
- RoundResolved(poolId, round, winningChoice, eliminatedCount, remainingCount)
- GameCompleted(poolId, winner, prizeAmount)
- StakeDeposited(creator, amount, poolsEligible)
- StakeWithdrawn(creator, amount, penalty)
- ProjectPoolUpdated(amount, source, totalPool)

---

© LastMonad — Built for the Monad ecosystem