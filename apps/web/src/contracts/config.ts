import { LAST_MONAD_ABI } from "./lastMonadABI";

// TODO: Replace with actual deployed contract address
export const LAST_MONAD_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export const lastMonadConfig = {
  address: LAST_MONAD_ADDRESS,
  abi: LAST_MONAD_ABI,
} as const;

// Player choice enum matches contract
export enum PlayerChoice {
  NONE = 0,
  HEADS = 1,
  TAILS = 2,
}

// Pool status enum matches contract
export enum PoolStatus {
  OPENED = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  ABANDONED = 3,
}
