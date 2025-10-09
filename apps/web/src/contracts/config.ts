import { LAST_MONAD_ABI } from "./lastMonadABI";

export const LAST_MONAD_ADDRESS = "0x36A89CDeC4911af8DFfaf8c0D5e4E96008249E9D" as `0x${string}`;

// Monad Testnet Chain ID
export const MONAD_TESTNET_CHAIN_ID = 10143;

export const lastMonadConfig = {
  address: LAST_MONAD_ADDRESS,
  abi: LAST_MONAD_ABI,
  chainId: MONAD_TESTNET_CHAIN_ID,
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
