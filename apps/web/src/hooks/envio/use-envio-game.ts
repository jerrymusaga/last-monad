import { useQuery } from '@tanstack/react-query';
import { envioClient, QUERIES } from '@/lib/envio-client';

// Types
export interface EnvioPlayer {
  id: string;
  player: string;
  joinedAt: bigint;
  isEliminated: boolean;
  eliminatedInRound?: bigint;
}

export interface EnvioRound {
  id: string;
  round: bigint;
  winningChoice?: bigint;
  eliminatedCount: bigint;
  remainingCount: bigint;
  isRepeated: boolean;
  unanimousChoice?: bigint;
  timestamp: bigint;
}

export interface EnvioPoolDetails {
  Pool: Array<{
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
    abandonedAt?: bigint;
    winner?: string;
    winnerPrize?: bigint;
    creatorReward?: bigint;
    winnerClaimed: boolean;
    creatorClaimed: boolean;
  }>;
  Player: EnvioPlayer[];
  Round: EnvioRound[];
}

// Hook to get complete pool/game details
export function useEnvioGameDetails(poolId: string) {
  return useQuery<EnvioPoolDetails>({
    queryKey: ['envio-game-details', poolId],
    queryFn: async () => {
      return await envioClient.request<EnvioPoolDetails>(
        QUERIES.GET_POOL_DETAILS,
        { poolId: Number(poolId) }
      );
    },
    enabled: !!poolId,
    refetchInterval: (query) => {
      // Refetch more frequently if game is active
      const pool = query.state.data?.Pool[0];
      return pool?.status === 'ACTIVE' ? 15000 : 30000;
    },
    staleTime: (query) => {
      // Keep data fresh longer for inactive games
      const pool = query.state.data?.Pool[0];
      return pool?.status === 'ACTIVE' ? 10000 : 20000;
    },
    refetchOnWindowFocus: false,
  });
}

// Hook to get just the rounds for a game
export function useEnvioGameRounds(poolId: string) {
  return useQuery<EnvioRound[]>({
    queryKey: ['envio-game-rounds', poolId],
    queryFn: async () => {
      const query = `
        query GetGameRounds($poolId: String!) {
          Round(
            where: { poolId: { _eq: $poolId } }
            order_by: { round: asc }
          ) {
            id
            round
            winningChoice
            eliminatedCount
            remainingCount
            isRepeated
            unanimousChoice
            timestamp
          }
        }
      `;
      const data = await envioClient.request<{ Round: EnvioRound[] }>(
        query,
        { poolId }
      );
      return data.Round;
    },
    enabled: !!poolId,
    refetchInterval: 20000, // Refetch every 20 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook to get players in a game
export function useEnvioGamePlayers(poolId: string) {
  return useQuery<EnvioPlayer[]>({
    queryKey: ['envio-game-players', poolId],
    queryFn: async () => {
      const query = `
        query GetGamePlayers($poolId: String!) {
          Player(where: { poolId: { _eq: $poolId } }) {
            id
            player
            joinedAt
            isEliminated
            eliminatedInRound
          }
        }
      `;
      const data = await envioClient.request<{ Player: EnvioPlayer[] }>(
        query,
        { poolId }
      );
      return data.Player;
    },
    enabled: !!poolId,
    refetchInterval: 20000, // Refetch every 20 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchOnWindowFocus: false,
  });
}
