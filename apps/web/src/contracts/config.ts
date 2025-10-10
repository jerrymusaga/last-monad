import { LAST_MONAD_ABI } from "./lastMonadABI";

export const LAST_MONAD_ADDRESS = "0xDEcD7907CF3D01479Ce690D4108977021060C7da" as `0x${string}`;

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
