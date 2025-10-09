/*
 * LastMonad Event Handlers - Enhanced with Aggregated Entities
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import { LastMonad } from "generated";

// Helper function to initialize global stats
async function ensureGlobalStats(context: any) {
  let stats = await context.GlobalStats.get("global");
  if (!stats) {
    context.GlobalStats.set({
      id: "global",
      totalPools: 0n,
      totalGamesCompleted: 0n,
      totalMonStaked: 0n,
      projectPoolBalance: 0n,
    });
  }
}

// 1. Pool Created Handler
LastMonad.PoolCreated.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_PoolCreated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    creator: event.params.creator,
    entryFee: event.params.entryFee,
    maxPlayers: event.params.maxPlayers,
  });

  // Create Pool aggregated entity
  context.Pool.set({
    id: event.params.poolId.toString(),
    poolId: event.params.poolId,
    creator: event.params.creator.toLowerCase(),
    entryFee: event.params.entryFee,
    maxPlayers: event.params.maxPlayers,
    currentPlayers: 0n,
    prizePool: 0n,
    status: "OPENED",
    createdAt: BigInt(event.block.timestamp),
  });

  // Update or create Creator entity
  let creator = await context.Creator.get(event.params.creator.toLowerCase());
  if (!creator) {
    creator = {
      id: event.params.creator.toLowerCase(),
      address: event.params.creator.toLowerCase(),
      stakedAmount: 0n,
      poolsCreated: 0n,
      poolsCompleted: 0n,
      totalRewards: 0n,
      hasActiveStake: true,
    };
  }
  context.Creator.set({
    ...creator,
    poolsCreated: creator.poolsCreated + 1n,
  });

  // Update global stats
  await ensureGlobalStats(context);
  const stats = await context.GlobalStats.get("global");
  if (stats) {
    context.GlobalStats.set({
      ...stats,
      totalPools: stats.totalPools + 1n,
    });
  }
});

// 2. Player Joined Handler
LastMonad.PlayerJoined.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_PlayerJoined.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    player: event.params.player,
    currentPlayers: event.params.currentPlayers,
    maxPlayers: event.params.maxPlayers,
  });

  // Update Pool entity
  const pool = await context.Pool.get(event.params.poolId.toString());
  if (pool) {
    context.Pool.set({
      ...pool,
      currentPlayers: event.params.currentPlayers,
      prizePool: pool.prizePool + pool.entryFee,
    });
  }

  // Create Player entity
  context.Player.set({
    id: `${event.params.poolId}-${event.params.player.toLowerCase()}`,
    poolId: event.params.poolId,
    player: event.params.player.toLowerCase(),
    joinedAt: BigInt(event.block.timestamp),
    isEliminated: false,
  });
});

// 3. Pool Activated Handler
LastMonad.PoolActivated.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_PoolActivated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    totalPlayers: event.params.totalPlayers,
    prizePool: event.params.prizePool,
  });

  // Update Pool entity
  const pool = await context.Pool.get(event.params.poolId.toString());
  if (pool) {
    context.Pool.set({
      ...pool,
      status: "ACTIVE",
      prizePool: event.params.prizePool,
      activatedAt: BigInt(event.block.timestamp),
    });
  }
});

// 4. Player Made Choice Handler
LastMonad.PlayerMadeChoice.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_PlayerMadeChoice.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    player: event.params.player,
    choice: event.params.choice,
    round: event.params.round,
  });
});

// 5. Round Resolved Handler
LastMonad.RoundResolved.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_RoundResolved.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    round: event.params.round,
    winningChoice: event.params.winningChoice,
    eliminatedCount: event.params.eliminatedCount,
    remainingCount: event.params.remainingCount,
  });

  // Create Round entity
  context.Round.set({
    id: `${event.params.poolId}-${event.params.round}`,
    poolId: event.params.poolId,
    round: event.params.round,
    winningChoice: event.params.winningChoice,
    eliminatedCount: event.params.eliminatedCount,
    remainingCount: event.params.remainingCount,
    isRepeated: false,
    timestamp: BigInt(event.block.timestamp),
  });
});

// 6. Round Repeated Handler
LastMonad.RoundRepeated.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_RoundRepeated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    round: event.params.round,
    unanimousChoice: event.params.unanimousChoice,
    playerCount: event.params.playerCount,
  });

  // Create Round entity for repeated round
  context.Round.set({
    id: `${event.params.poolId}-${event.params.round}-repeated`,
    poolId: event.params.poolId,
    round: event.params.round,
    unanimousChoice: event.params.unanimousChoice,
    eliminatedCount: 0n,
    remainingCount: event.params.playerCount,
    isRepeated: true,
    timestamp: BigInt(event.block.timestamp),
  });
});

// 7. Game Completed Handler
LastMonad.GameCompleted.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_GameCompleted.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    winner: event.params.winner,
    prizeAmount: event.params.prizeAmount,
  });

  // Update Pool entity
  const pool = await context.Pool.get(event.params.poolId.toString());
  if (pool) {
    const creatorReward = (pool.prizePool * 12n) / 100n;
    context.Pool.set({
      ...pool,
      status: "COMPLETED",
      winner: event.params.winner.toLowerCase(),
      winnerPrize: event.params.prizeAmount,
      creatorReward: creatorReward,
      completedAt: BigInt(event.block.timestamp),
    });

    // Update Creator stats
    const creator = await context.Creator.get(pool.creator);
    if (creator) {
      context.Creator.set({
        ...creator,
        poolsCompleted: creator.poolsCompleted + 1n,
        totalRewards: creator.totalRewards + creatorReward,
      });
    }
  }

  // Update global stats
  const stats = await context.GlobalStats.get("global");
  if (stats) {
    context.GlobalStats.set({
      ...stats,
      totalGamesCompleted: stats.totalGamesCompleted + 1n,
    });
  }
});

// 8. Pool Abandoned Handler
LastMonad.PoolAbandoned.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_PoolAbandoned.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    poolId: event.params.poolId,
    creator: event.params.creator,
    refundAmount: event.params.refundAmount,
  });

  // Update Pool entity
  const pool = await context.Pool.get(event.params.poolId.toString());
  if (pool) {
    context.Pool.set({
      ...pool,
      status: "ABANDONED",
      abandonedAt: BigInt(event.block.timestamp),
    });
  }
});

// 9. Stake Deposited Handler
LastMonad.StakeDeposited.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_StakeDeposited.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    creator: event.params.creator,
    amount: event.params.amount,
    poolsEligible: event.params.poolsEligible,
  });

  // Update or create Creator entity
  let creator = await context.Creator.get(event.params.creator.toLowerCase());
  if (!creator) {
    creator = {
      id: event.params.creator.toLowerCase(),
      address: event.params.creator.toLowerCase(),
      stakedAmount: 0n,
      poolsCreated: 0n,
      poolsCompleted: 0n,
      totalRewards: 0n,
      hasActiveStake: false,
    };
  }
  context.Creator.set({
    ...creator,
    stakedAmount: event.params.amount,
    hasActiveStake: true,
  });

  // Update global stats
  const stats = await context.GlobalStats.get("global");
  if (stats) {
    context.GlobalStats.set({
      ...stats,
      totalMonStaked: stats.totalMonStaked + event.params.amount,
    });
  }
});

// 10. Stake Withdrawn Handler
LastMonad.StakeWithdrawn.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_StakeWithdrawn.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    creator: event.params.creator,
    amount: event.params.amount,
    penalty: event.params.penalty,
  });

  // Update Creator entity
  const creator = await context.Creator.get(event.params.creator.toLowerCase());
  if (creator) {
    context.Creator.set({
      ...creator,
      stakedAmount: 0n,
      hasActiveStake: false,
    });
  }
});

// 11. Creator Reward Claimed Handler
LastMonad.CreatorRewardClaimed.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_CreatorRewardClaimed.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    creator: event.params.creator,
    amount: event.params.amount,
  });
});

// 12. Project Pool Updated Handler
LastMonad.ProjectPoolUpdated.handler(async ({ event, context }: any) => {
  // Store raw event
  context.LastMonad_ProjectPoolUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    amount: event.params.amount,
    source: event.params.source,
    totalPool: event.params.totalPool,
  });

  // Update global stats
  const stats = await context.GlobalStats.get("global");
  if (stats) {
    context.GlobalStats.set({
      ...stats,
      projectPoolBalance: event.params.totalPool,
    });
  }
});

// 13. Ownership Transferred Handler (optional, for completeness)
LastMonad.OwnershipTransferred.handler(async ({ event, context }: any) => {
  context.LastMonad_OwnershipTransferred.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  });
});
