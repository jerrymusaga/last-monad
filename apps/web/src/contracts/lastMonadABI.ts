export const LAST_MONAD_ABI = [
        {
            "type": "constructor",
            "inputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "BASE_STAKE",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "CREATOR_REWARD_PERCENTAGE",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "MAX_STAKE_ALLOWED",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "PENALTY_PERCENTAGE",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "POOL_MULTIPLIER",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "activatePool",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "areAllPoolsCompleted",
            "inputs": [
                {
                    "name": "_creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "calculateCreatorReward",
            "inputs": [
                {
                    "name": "_creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "calculatePoolsEligible",
            "inputs": [
                {
                    "name": "stakeAmount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "canActivatePool",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "claimCreatorReward",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "claimPrize",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "claimRefundFromAbandonedPool",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "claimWinnerPrize",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "createPool",
            "inputs": [
                {
                    "name": "_entryFee",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_maxPlayers",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "currentPoolId",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getCreatedPools",
            "inputs": [
                {
                    "name": "_creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getCreatorInfo",
            "inputs": [
                {
                    "name": "_creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "stakedAmount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "poolsCreated",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "poolsRemaining",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "hasActiveStake",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getCurrentRound",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getGameProgress",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "currentRound",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "remainingPlayersCount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "totalPlayersCount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "isGameComplete",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getPlayerChoice",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_player",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint8",
                    "internalType": "enum LastMonad.PlayerChoice"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getPoolInfo",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "entryFee",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "maxPlayers",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "currentPlayers",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "prizePool",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "status",
                    "type": "uint8",
                    "internalType": "enum LastMonad.PoolStatus"
                },
                {
                    "name": "winnerClaimed",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "creatorClaimed",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getProjectPoolBalance",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getRemainingPlayers",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "hasPlayerChosen",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_player",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isPlayerEliminated",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_player",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isPoolAbandoned",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "joinPool",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "makeSelection",
            "inputs": [
                {
                    "name": "_poolId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_choice",
                    "type": "uint8",
                    "internalType": "enum LastMonad.PlayerChoice"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "poolCreators",
            "inputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "stakedAmount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "poolsCreated",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "poolsRemaining",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "totalPools",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "hasActiveStake",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "stakedAt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "pools",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "entryFee",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "maxPlayers",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "currentPlayers",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "prizePool",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "status",
                    "type": "uint8",
                    "internalType": "enum LastMonad.PoolStatus"
                },
                {
                    "name": "createdAt",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "currentRound",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "winnerClaimed",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "creatorClaimed",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "projectPool",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "renounceOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "stakeForPoolCreation",
            "inputs": [],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "transferOwnership",
            "inputs": [
                {
                    "name": "newOwner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "unstakeAndClaim",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "withdrawProjectPoolFunds",
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "CreatorRewardClaimed",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "CreatorRewardClaimedFromPool",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "GameCompleted",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "winner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "prizeAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "OwnershipTransferred",
            "inputs": [
                {
                    "name": "previousOwner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "newOwner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PlayerJoined",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "player",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "currentPlayers",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "maxPlayers",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PlayerMadeChoice",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "player",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "choice",
                    "type": "uint8",
                    "indexed": false,
                    "internalType": "enum LastMonad.PlayerChoice"
                },
                {
                    "name": "round",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PoolAbandoned",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "refundAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PoolActivated",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "totalPlayers",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "prizePool",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PoolCreated",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "entryFee",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "maxPlayers",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ProjectPoolUpdated",
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "source",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "totalPool",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "RoundRepeated",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "round",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "unanimousChoice",
                    "type": "uint8",
                    "indexed": false,
                    "internalType": "enum LastMonad.PlayerChoice"
                },
                {
                    "name": "playerCount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "RoundResolved",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "round",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "winningChoice",
                    "type": "uint8",
                    "indexed": false,
                    "internalType": "enum LastMonad.PlayerChoice"
                },
                {
                    "name": "eliminatedCount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "remainingCount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "StakeDeposited",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "poolsEligible",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "StakeWithdrawn",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "penalty",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WinnerPrizeClaimed",
            "inputs": [
                {
                    "name": "poolId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "winner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "OwnableInvalidOwner",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ]
        },
        {
            "type": "error",
            "name": "OwnableUnauthorizedAccount",
            "inputs": [
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ]
        },
        {
            "type": "error",
            "name": "ReentrancyGuardReentrantCall",
            "inputs": []
        }
    ] as const;
