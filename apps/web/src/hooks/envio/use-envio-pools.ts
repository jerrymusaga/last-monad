import { useQuery } from '@tanstack/react-query';
import { envioClient, QUERIES } from '@/lib/envio-client';

// Types
export interface EnvioPool {
  id: string;
  poolId: bigint;
  creator: string;
  entryFee: bigint;
  maxPlayers: bigint;
  currentPlayers: bigint;
  prizePool: bigint;
  status: string;
  createdAt: bigint;
  activatedAt?: bigint;
  completedAt?: bigint;
  winner?: string;
  winnerPrize?: bigint;
  creatorReward?: bigint;
}

interface PoolsResponse {
  Pool: EnvioPool[];
}

// Hook to get pools with optional status filter
export function useEnvioPools(status?: string, limit: number = 50) {
  return useQuery<EnvioPool[]>({
    queryKey: ['envio-pools', status, limit],
    queryFn: async () => {
      const data = await envioClient.request<PoolsResponse>(
        QUERIES.GET_POOLS,
        { status, limit }
      );
      return data.Pool;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Hook to get all pools (no filter)
export function useEnvioAllPools(limit: number = 100) {
  return useQuery<EnvioPool[]>({
    queryKey: ['envio-all-pools', limit],
    queryFn: async () => {
      const query = `
        query GetAllPools($limit: Int) {
          Pool(order_by: { createdAt: desc }, limit: $limit) {
            id
            poolId
            creator
            entryFee
            maxPlayers
            currentPlayers
            prizePool
            status
            createdAt
            activatedAt
            completedAt
            winner
            winnerPrize
          }
        }
      `;
      const data = await envioClient.request<PoolsResponse>(query, { limit });
      return data.Pool;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Hook to get active games
export function useEnvioActiveGames() {
  return useQuery<EnvioPool[]>({
    queryKey: ['envio-active-games'],
    queryFn: async () => {
      const data = await envioClient.request<PoolsResponse>(
        QUERIES.GET_ACTIVE_GAMES
      );
      return data.Pool;
    },
    refetchInterval: 15000, // Refetch every 15 seconds for active games
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook to get recent completed games
export function useEnvioRecentGames(limit: number = 10) {
  return useQuery<EnvioPool[]>({
    queryKey: ['envio-recent-games', limit],
    queryFn: async () => {
      const data = await envioClient.request<PoolsResponse>(
        QUERIES.GET_RECENT_GAMES,
        { limit }
      );
      return data.Pool;
    },
    refetchInterval: 60000, // Refetch every 60 seconds for completed games
    staleTime: 45000, // Consider data fresh for 45 seconds
    refetchOnWindowFocus: false,
  });
}
