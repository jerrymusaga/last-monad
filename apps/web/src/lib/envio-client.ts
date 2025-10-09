import { GraphQLClient } from 'graphql-request';

// Envio GraphQL endpoint
export const envioClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_ENVIO_URL || 'http://localhost:8080/v1/graphql'
);

// GraphQL queries for common operations
export const QUERIES = {
  GET_POOLS: `
    query GetPools($status: String, $limit: Int) {
      Pool(
        where: { status: { _eq: $status } }
        order_by: { createdAt: desc }
        limit: $limit
      ) {
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
        creatorReward
      }
    }
  `,

  GET_POOL_DETAILS: `
    query GetPoolDetails($poolId: numeric!) {
      Pool(where: { poolId: { _eq: $poolId } }) {
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
        abandonedAt
        winner
        winnerPrize
        creatorReward
      }

      Player(where: { poolId: { _eq: $poolId } }) {
        id
        poolId
        player
        joinedAt
        isEliminated
        eliminatedInRound
      }

      Round(where: { poolId: { _eq: $poolId } }, order_by: { round: asc }) {
        id
        poolId
        round
        winningChoice
        eliminatedCount
        remainingCount
        isRepeated
        unanimousChoice
        timestamp
      }
    }
  `,

  GET_CREATOR_STATS: `
    query GetCreatorStats($address: String!) {
      Creator(where: { address: { _eq: $address } }) {
        id
        address
        stakedAmount
        poolsCreated
        poolsCompleted
        totalRewards
        hasActiveStake
      }
    }
  `,

  GET_CREATOR_POOLS: `
    query GetCreatorPools($creator: String!) {
      Pool(
        where: { creator: { _eq: $creator } }
        order_by: { createdAt: desc }
      ) {
        id
        poolId
        entryFee
        maxPlayers
        currentPlayers
        prizePool
        status
        createdAt
        completedAt
      }
    }
  `,

  GET_PLAYER_HISTORY: `
    query GetPlayerHistory($player: String!) {
      Player(where: { player: { _eq: $player } }) {
        id
        poolId
        joinedAt
        isEliminated
        eliminatedInRound
      }
    }
  `,

  GET_GLOBAL_STATS: `
    query GetGlobalStats {
      GlobalStats(where: { id: { _eq: "global" } }) {
        id
        totalPools
        totalGamesCompleted
        totalMonStaked
        projectPoolBalance
      }
    }
  `,

  GET_RECENT_GAMES: `
    query GetRecentGames($limit: Int) {
      Pool(
        where: { status: { _eq: "COMPLETED" } }
        order_by: { completedAt: desc }
        limit: $limit
      ) {
        id
        poolId
        creator
        entryFee
        maxPlayers
        prizePool
        winner
        winnerPrize
        completedAt
      }
    }
  `,

  GET_ACTIVE_GAMES: `
    query GetActiveGames {
      Pool(
        where: { status: { _eq: "ACTIVE" } }
        order_by: { activatedAt: desc }
      ) {
        id
        poolId
        creator
        entryFee
        maxPlayers
        currentPlayers
        prizePool
        activatedAt
      }
    }
  `,
};
