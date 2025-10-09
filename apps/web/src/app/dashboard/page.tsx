"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";
import {
  useEnvioCreatorStats,
  useEnvioCreatorPools,
  useEnvioPlayerHistory,
} from "@/hooks/envio";
import { formatEther } from "viem";
import { useActivatePool, useClaimPrize } from "@/hooks/use-last-monad";

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  // Fetch data from Envio
  const { data: creatorStats, isLoading: creatorLoading } = useEnvioCreatorStats(address);
  const { data: createdPoolsData, isLoading: poolsLoading } = useEnvioCreatorPools(address);
  const { data: playerHistory, isLoading: historyLoading } = useEnvioPlayerHistory(address);

  // Calculate stats
  const stakedAmount = creatorStats?.stakedAmount
    ? parseFloat(formatEther(creatorStats.stakedAmount)).toFixed(2)
    : "0";
  const totalEarnings = creatorStats?.totalRewards
    ? parseFloat(formatEther(creatorStats.totalRewards)).toFixed(2)
    : "0";
  const totalPoolsCreated = Number(creatorStats?.poolsCreated || 0n);
  const completedPools = Number(creatorStats?.poolsCompleted || 0n);

  const createdPools = createdPoolsData || [];
  const joinedPools = playerHistory || [];

  // Contract write hooks
  const { activatePool, isPending: isActivating } = useActivatePool();
  const { claimPrize, isPending: isClaiming } = useClaimPrize();

  const handleActivatePool = async (poolId: bigint) => {
    try {
      activatePool(poolId);
    } catch (error) {
      console.error("Error activating pool:", error);
    }
  };

  const handleClaimPrize = async (poolId: bigint) => {
    try {
      claimPrize(poolId);
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  if (!isMiniAppReady) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing...</p>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Wallet Required</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to view your dashboard
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2">
              📊 Dashboard
            </h1>
            <p className="text-gray-400 font-mono">{address}</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {creatorLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6 animate-pulse">
                    <div className="h-4 w-24 bg-gray-700 rounded mb-3"></div>
                    <div className="h-8 w-20 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-2 border-purple-500/50 rounded-xl p-6">
                  <p className="text-purple-400 text-sm font-medium mb-2">💰 Total Earnings</p>
                  <p className="text-3xl font-black text-white">
                    {totalEarnings} <span className="text-lg text-gray-400">MON</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-2 border-blue-500/50 rounded-xl p-6">
                  <p className="text-blue-400 text-sm font-medium mb-2">🎨 Pools Created</p>
                  <p className="text-3xl font-black text-white">{totalPoolsCreated}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-2 border-green-500/50 rounded-xl p-6">
                  <p className="text-green-400 text-sm font-medium mb-2">✅ Completed</p>
                  <p className="text-3xl font-black text-white">{completedPools}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-2 border-yellow-500/50 rounded-xl p-6">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🔒 Staked</p>
                  <p className="text-3xl font-black text-white">
                    {stakedAmount} <span className="text-lg text-gray-400">MON</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => router.push("/create-pool")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold transition-all hover:scale-105"
            >
              ➕ Create New Pool
            </button>
            <button
              onClick={() => router.push("/pools")}
              className="bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105"
            >
              🎮 Browse Pools
            </button>
            <button
              onClick={() => router.push("/unstake")}
              className="bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105"
            >
              💸 Unstake
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-2 mb-8 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("created")}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === "created"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🎨 My Pools ({createdPools.length})
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === "joined"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🎮 Joined Games ({joinedPools.length})
            </button>
          </div>

          {/* Created Pools Tab */}
          {activeTab === "created" && (
            <div className="space-y-6">
              {poolsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-800/50 border-2 border-gray-700 rounded-2xl p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="h-6 w-32 bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 w-24 bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-10 w-32 bg-gray-700 rounded-lg"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="bg-gray-900/50 rounded-lg p-4">
                            <div className="h-3 w-16 bg-gray-700 rounded mb-2"></div>
                            <div className="h-5 w-20 bg-gray-700 rounded"></div>
                          </div>
                        ))}
                      </div>
                      <div className="h-10 w-full bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </>
              ) : createdPools.length === 0 ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Pools Created</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first pool and start earning royalties!
                  </p>
                  <button
                    onClick={() => router.push("/create-pool")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Create Pool
                  </button>
                </div>
              ) : (
                createdPools.map((pool) => (
                  <div
                    key={pool.id}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-6 hover:border-purple-500 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Pool #{pool.poolId.toString()}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              pool.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                : pool.status === "ACTIVE"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                            }`}
                          >
                            {pool.status === "COMPLETED" && "✅ Completed"}
                            {pool.status === "ACTIVE" && "⚔️ Active"}
                            {pool.status === "OPENED" && "⏳ Waiting"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {pool.status === "OPENED" && (
                          (() => {
                            const currentPlayers = Number(pool.currentPlayers);
                            const maxPlayers = Number(pool.maxPlayers);
                            const fillPercentage = (currentPlayers / maxPlayers) * 100;
                            const canActivate = fillPercentage >= 50;

                            return (
                              <button
                                onClick={() => handleActivatePool(pool.poolId)}
                                disabled={!canActivate || isActivating}
                                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                  canActivate
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                }`}
                                title={!canActivate ? `Need ${Math.ceil(maxPlayers * 0.5)} players (50%) to activate` : "Start the game now"}
                              >
                                {isActivating ? "⏳ Activating..." : canActivate ? "🚀 Activate Pool" : `🔒 ${fillPercentage.toFixed(0)}% Full`}
                              </button>
                            );
                          })()
                        )}
                        {pool.status === "COMPLETED" && pool.creatorReward && (
                          <button
                            onClick={() => handleClaimPrize(pool.poolId)}
                            disabled={isClaiming}
                            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                          >
                            {isClaiming ? "⏳ Claiming..." : "💰 Claim Reward"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Entry Fee</p>
                        <p className="text-white font-bold">{parseFloat(formatEther(pool.entryFee)).toFixed(2)} MON</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Players</p>
                        <p className="text-white font-bold">
                          {pool.currentPlayers.toString()}/{pool.maxPlayers.toString()}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                        <p className="text-white font-bold">{parseFloat(formatEther(pool.prizePool)).toFixed(2)} MON</p>
                      </div>
                      <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                        <p className="text-purple-400 text-sm mb-1">Your Royalty</p>
                        <p className="text-white font-bold">{pool.creatorReward ? parseFloat(formatEther(pool.creatorReward)).toFixed(2) : "0"} MON</p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/game/${pool.poolId}`)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all"
                    >
                      View Details →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Joined Pools Tab */}
          {activeTab === "joined" && (
            <div className="space-y-6">
              {joinedPools.length === 0 ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Games Joined</h3>
                  <p className="text-gray-400 mb-6">Browse pools and join your first game!</p>
                  <button
                    onClick={() => router.push("/pools")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Browse Pools
                  </button>
                </div>
              ) : (
                joinedPools.map((playerData) => (
                  <div
                    key={playerData.id}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-6 hover:border-blue-500 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Pool #{playerData.poolId.toString()}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {playerData.isEliminated ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/50">
                              ❌ Eliminated in Round {playerData.eliminatedInRound?.toString()}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                              ✅ Still In Game
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Joined At</p>
                        <p className="text-white font-bold">
                          {new Date(Number(playerData.joinedAt) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Status</p>
                        <p className="text-white font-bold">
                          {playerData.isEliminated ? "Eliminated" : "Active"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/game/${playerData.poolId}`)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all"
                    >
                      View Game →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
