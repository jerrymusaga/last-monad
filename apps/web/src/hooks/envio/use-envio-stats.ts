import { useQuery } from '@tanstack/react-query';
import { envioClient, QUERIES } from '@/lib/envio-client';
import { EnvioPool } from './use-envio-pools';

// Types
export interface EnvioCreator {
  id: string;
  address: string;
  stakedAmount: bigint;
  poolsCreated: bigint;
  poolsCompleted: bigint;
  totalRewards: bigint;
  hasActiveStake: boolean;
}

export interface EnvioGlobalStats {
  id: string;
  totalPools: bigint;
  totalGamesCompleted: bigint;
  totalMonStaked: bigint;
  projectPoolBalance: bigint;
}

// Hook to get creator stats
export function useEnvioCreatorStats(address?: string) {
  return useQuery<EnvioCreator | null>({
    queryKey: ['envio-creator-stats', address?.toLowerCase()],
    queryFn: async () => {
      if (!address) return null;

      const data = await envioClient.request<{ Creator: EnvioCreator[] }>(
        QUERIES.GET_CREATOR_STATS,
        { address: address.toLowerCase() }
      );
      return data.Creator[0] || null;
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook to get creator's pools
export function useEnvioCreatorPools(creator?: string) {
  return useQuery<EnvioPool[]>({
    queryKey: ['envio-creator-pools', creator?.toLowerCase()],
    queryFn: async () => {
      if (!creator) return [];

      const data = await envioClient.request<{ Pool: EnvioPool[] }>(
        QUERIES.GET_CREATOR_POOLS,
        { creator: creator.toLowerCase() }
      );
      return data.Pool;
    },
    enabled: !!creator,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook to get player history
export function useEnvioPlayerHistory(player?: string) {
  return useQuery({
    queryKey: ['envio-player-history', player?.toLowerCase()],
    queryFn: async () => {
      if (!player) return [];

      const data = await envioClient.request<{
        Player: Array<{
          id: string;
          poolId: bigint;
          joinedAt: bigint;
          isEliminated: boolean;
          eliminatedInRound?: bigint;
        }>;
      }>(QUERIES.GET_PLAYER_HISTORY, { player: player.toLowerCase() });
      return data.Player;
    },
    enabled: !!player,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook to get global platform stats
export function useEnvioGlobalStats() {
  return useQuery<EnvioGlobalStats | null>({
    queryKey: ['envio-global-stats'],
    queryFn: async () => {
      const data = await envioClient.request<{ GlobalStats: EnvioGlobalStats[] }>(
        QUERIES.GET_GLOBAL_STATS
      );
      return data.GlobalStats[0] || null;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 45000, // Consider data fresh for 45 seconds
    refetchOnWindowFocus: false,
  });
}
