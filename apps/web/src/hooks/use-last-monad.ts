import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { lastMonadConfig, PlayerChoice, PoolStatus } from "@/contracts/config";
import { useCallback } from "react";

// ============================================================================
// STAKING HOOKS
// ============================================================================

/**
 * Get creator information for an address
 */
export function useCreatorInfo(address?: `0x${string}`) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getCreatorInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    creatorInfo: data
      ? {
          stakedAmount: data[0],
          poolsCreated: Number(data[1]),
          poolsRemaining: Number(data[2]),
          hasActiveStake: data[3],
        }
      : null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Calculate how many pools are eligible for a stake amount
 */
export function useCalculatePoolsEligible(stakeAmount: bigint) {
  const { data } = useReadContract({
    ...lastMonadConfig,
    functionName: "calculatePoolsEligible",
    args: [stakeAmount],
  });

  return {
    poolsEligible: data ? Number(data) : 0,
  };
}

/**
 * Stake MON to become a pool creator
 */
export function useStakeForPoolCreation() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const stake = useCallback(
    (amount: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "stakeForPoolCreation",
        value: amount,
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    stake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Check if all creator's pools are completed
 */
export function useAreAllPoolsCompleted(address?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "areAllPoolsCompleted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    allPoolsCompleted: data ?? false,
    refetch,
  };
}

/**
 * Calculate total creator rewards
 */
export function useCalculateCreatorReward(address?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "calculateCreatorReward",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    totalReward: data ?? 0n,
    refetch,
  };
}

/**
 * Unstake and claim rewards
 */
export function useUnstakeAndClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unstake = useCallback(() => {
    writeContract({
      ...lastMonadConfig,
      functionName: "unstakeAndClaim",
      chainId: lastMonadConfig.chainId,
    });
  }, [writeContract]);

  return {
    unstake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================================================
// POOL CREATION & MANAGEMENT HOOKS
// ============================================================================

/**
 * Create a new pool
 */
export function useCreatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPool = useCallback(
    (entryFee: bigint, maxPlayers: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "createPool",
        args: [entryFee, maxPlayers],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    createPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Get pool information
 */
export function usePoolInfo(poolId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getPoolInfo",
    args: poolId !== undefined ? [poolId] : undefined,
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    poolInfo: data
      ? {
          creator: data[0],
          entryFee: data[1],
          maxPlayers: Number(data[2]),
          currentPlayers: Number(data[3]),
          prizePool: data[4],
          status: data[5] as PoolStatus,
        }
      : null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get all pools created by an address
 */
export function useCreatedPools(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getCreatedPools",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    poolIds: data ?? [],
    isLoading,
    refetch,
  };
}

/**
 * Get current pool ID (latest pool created)
 */
export function useCurrentPoolId() {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "currentPoolId",
  });

  return {
    currentPoolId: data ?? 0n,
    refetch,
  };
}

/**
 * Check if a pool can be activated
 */
export function useCanActivatePool(poolId?: bigint) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "canActivatePool",
    args: poolId !== undefined ? [poolId] : undefined,
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    canActivate: data ?? false,
    refetch,
  };
}

/**
 * Manually activate a pool
 */
export function useActivatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const activatePool = useCallback(
    (poolId: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "activatePool",
        args: [poolId],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    activatePool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================================================
// PLAYER ACTION HOOKS
// ============================================================================

/**
 * Join a pool
 */
export function useJoinPool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const joinPool = useCallback(
    (poolId: bigint, entryFee: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "joinPool",
        args: [poolId],
        value: entryFee,
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    joinPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Make a choice (HEADS or TAILS) in a round
 */
export function useMakeSelection() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const makeSelection = useCallback(
    (poolId: bigint, choice: PlayerChoice) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "makeSelection",
        args: [poolId, choice],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    makeSelection,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Claim prize after winning (legacy - redirects to claimWinnerPrize)
 */
export function useClaimPrize() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = useCallback(
    (poolId: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "claimPrize",
        args: [poolId],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    claimPrize,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Claim winner prize (88% of prize pool)
 */
export function useClaimWinnerPrize() {
  const { writeContract, data: hash, isPending, error} = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimWinnerPrize = useCallback(
    (poolId: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "claimWinnerPrize",
        args: [poolId],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    claimWinnerPrize,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Claim creator reward (12% of prize pool) from a specific pool
 */
export function useClaimCreatorReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimCreatorReward = useCallback(
    (poolId: bigint) => {
      writeContract({
        ...lastMonadConfig,
        functionName: "claimCreatorReward",
        args: [poolId],
        chainId: lastMonadConfig.chainId,
      });
    },
    [writeContract]
  );

  return {
    claimCreatorReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================================================
// GAME STATE HOOKS
// ============================================================================

/**
 * Get remaining players in a pool
 */
export function useRemainingPlayers(poolId?: bigint) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getRemainingPlayers",
    args: poolId !== undefined ? [poolId] : undefined,
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    remainingPlayers: data ?? [],
    refetch,
  };
}

/**
 * Get current round number
 */
export function useCurrentRound(poolId?: bigint) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getCurrentRound",
    args: poolId !== undefined ? [poolId] : undefined,
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    currentRound: data ? Number(data) : 0,
    refetch,
  };
}

/**
 * Get player's choice for a pool
 */
export function usePlayerChoice(poolId?: bigint, playerAddress?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getPlayerChoice",
    args: poolId !== undefined && playerAddress ? [poolId, playerAddress] : undefined,
    query: {
      enabled: poolId !== undefined && !!playerAddress,
    },
  });

  return {
    choice: data as PlayerChoice | undefined,
    refetch,
  };
}

/**
 * Check if player is eliminated
 */
export function useIsPlayerEliminated(poolId?: bigint, playerAddress?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "isPlayerEliminated",
    args: poolId !== undefined && playerAddress ? [poolId, playerAddress] : undefined,
    query: {
      enabled: poolId !== undefined && !!playerAddress,
    },
  });

  return {
    isEliminated: data ?? false,
    refetch,
  };
}

/**
 * Get complete game progress
 */
export function useGameProgress(poolId?: bigint) {
  const { data, refetch } = useReadContract({
    ...lastMonadConfig,
    functionName: "getGameProgress",
    args: poolId !== undefined ? [poolId] : undefined,
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    gameProgress: data
      ? {
          currentRound: Number(data[0]),
          remainingPlayersCount: Number(data[1]),
          totalPlayersCount: Number(data[2]),
          isGameComplete: data[3],
        }
      : null,
    refetch,
  };
}

// ============================================================================
// CONTRACT CONSTANTS
// ============================================================================

/**
 * Get BASE_STAKE constant (2 MON)
 */
export function useBaseStake() {
  const { data } = useReadContract({
    ...lastMonadConfig,
    functionName: "BASE_STAKE",
  });

  return {
    baseStake: data ?? 0n,
  };
}

/**
 * Get MAX_STAKE_ALLOWED constant (200 MON)
 */
export function useMaxStake() {
  const { data } = useReadContract({
    ...lastMonadConfig,
    functionName: "MAX_STAKE_ALLOWED",
  });

  return {
    maxStake: data ?? 0n,
  };
}

/**
 * Get CREATOR_REWARD_PERCENTAGE constant (12%)
 */
export function useCreatorRewardPercentage() {
  const { data } = useReadContract({
    ...lastMonadConfig,
    functionName: "CREATOR_REWARD_PERCENTAGE",
  });

  return {
    rewardPercentage: data ? Number(data) : 0,
  };
}

// ============================================================================
// EVENT WATCHING HOOKS
// ============================================================================

/**
 * Watch for PoolCreated events
 */
export function useWatchPoolCreated(onPoolCreated?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "PoolCreated",
    onLogs: (logs) => {
      if (onPoolCreated) {
        logs.forEach((log) => onPoolCreated(log));
      }
    },
  });
}

/**
 * Watch for PlayerJoined events
 */
export function useWatchPlayerJoined(onPlayerJoined?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "PlayerJoined",
    onLogs: (logs) => {
      if (onPlayerJoined) {
        logs.forEach((log) => onPlayerJoined(log));
      }
    },
  });
}

/**
 * Watch for GameCompleted events
 */
export function useWatchGameCompleted(onGameCompleted?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "GameCompleted",
    onLogs: (logs) => {
      if (onGameCompleted) {
        logs.forEach((log) => onGameCompleted(log));
      }
    },
  });
}

/**
 * Watch for PoolActivated events
 */
export function useWatchPoolActivated(onPoolActivated?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "PoolActivated",
    onLogs: (logs) => {
      if (onPoolActivated) {
        logs.forEach((log) => onPoolActivated(log));
      }
    },
  });
}

/**
 * Watch for PlayerMadeChoice events
 */
export function useWatchPlayerMadeChoice(onPlayerMadeChoice?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "PlayerMadeChoice",
    onLogs: (logs) => {
      if (onPlayerMadeChoice) {
        logs.forEach((log) => onPlayerMadeChoice(log));
      }
    },
  });
}

/**
 * Watch for RoundResolved events (Critical for game progression)
 */
export function useWatchRoundResolved(onRoundResolved?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "RoundResolved",
    onLogs: (logs) => {
      if (onRoundResolved) {
        logs.forEach((log) => onRoundResolved(log));
      }
    },
  });
}

/**
 * Watch for RoundRepeated events
 */
export function useWatchRoundRepeated(onRoundRepeated?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "RoundRepeated",
    onLogs: (logs) => {
      if (onRoundRepeated) {
        logs.forEach((log) => onRoundRepeated(log));
      }
    },
  });
}

/**
 * Watch for PoolAbandoned events
 */
export function useWatchPoolAbandoned(onPoolAbandoned?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "PoolAbandoned",
    onLogs: (logs) => {
      if (onPoolAbandoned) {
        logs.forEach((log) => onPoolAbandoned(log));
      }
    },
  });
}

/**
 * Watch for StakeDeposited events
 */
export function useWatchStakeDeposited(onStakeDeposited?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "StakeDeposited",
    onLogs: (logs) => {
      if (onStakeDeposited) {
        logs.forEach((log) => onStakeDeposited(log));
      }
    },
  });
}

/**
 * Watch for StakeWithdrawn events
 */
export function useWatchStakeWithdrawn(onStakeWithdrawn?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "StakeWithdrawn",
    onLogs: (logs) => {
      if (onStakeWithdrawn) {
        logs.forEach((log) => onStakeWithdrawn(log));
      }
    },
  });
}

/**
 * Watch for CreatorRewardClaimed events
 */
export function useWatchCreatorRewardClaimed(onCreatorRewardClaimed?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "CreatorRewardClaimed",
    onLogs: (logs) => {
      if (onCreatorRewardClaimed) {
        logs.forEach((log) => onCreatorRewardClaimed(log));
      }
    },
  });
}

/**
 * Watch for ProjectPoolUpdated events
 */
export function useWatchProjectPoolUpdated(onProjectPoolUpdated?: (log: any) => void) {
  useWatchContractEvent({
    ...lastMonadConfig,
    eventName: "ProjectPoolUpdated",
    onLogs: (logs) => {
      if (onProjectPoolUpdated) {
        logs.forEach((log) => onProjectPoolUpdated(log));
      }
    },
  });
}
