"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useEnvioGameDetails } from "@/hooks/envio";
import { formatEther } from "viem";
import { useJoinPool } from "@/hooks/use-last-monad";

export default function PoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();

  const poolId = params.id as string;
  const poolIdBigInt = BigInt(poolId);

  // Fetch game data from Envio
  const { data: gameData, isLoading, error: queryError, refetch: refetchGame } = useEnvioGameDetails(poolId);

  // Contract write hooks
  const { joinPool, isPending: isJoining, isSuccess: joinSuccess, error: joinError } = useJoinPool();

  const pool = useMemo(() => {
    if (!gameData || !gameData.Pool[0]) return null;
    return gameData.Pool[0];
  }, [gameData]);

  // Debug logging
  useEffect(() => {
    console.log('Pool ID:', poolId);
    console.log('Is Loading:', isLoading);
    console.log('Query Error:', queryError);
    console.log('Game Data:', gameData);
    console.log('Pool:', pool);
  }, [poolId, isLoading, queryError, gameData, pool]);

  const players = gameData?.Player || [];
  const isPlayerInPool = players.some((p) => p.player.toLowerCase() === address?.toLowerCase());
  const isCreator = pool?.creator.toLowerCase() === address?.toLowerCase();

  // Redirect to game page if pool is ACTIVE (game has started) AND user is a player
  useEffect(() => {
    if (pool && pool.status === "ACTIVE" && isPlayerInPool) {
      router.push(`/game/${poolId}`);
    }
  }, [pool, poolId, router, isPlayerInPool]);

  // Handle successful join with polling for indexer
  useEffect(() => {
    if (joinSuccess) {
      // Immediate refetch
      refetchGame();

      // Poll a few more times to ensure indexer has caught up
      const pollInterval = setInterval(() => {
        refetchGame();
      }, 2000); // Every 2 seconds

      // Stop polling after 10 seconds
      setTimeout(() => clearInterval(pollInterval), 10000);

      return () => clearInterval(pollInterval);
    }
  }, [joinSuccess, refetchGame]);

  const handleJoinPool = async () => {
    if (!isConnected || !address || !pool) {
      return;
    }

    try {
      joinPool(poolIdBigInt, pool.entryFee);
    } catch (error) {
      console.error("Error joining pool:", error);
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

  if (queryError) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Pool</h2>
          <p className="text-gray-300 mb-4">{queryError.message}</p>
          <button
            onClick={() => router.push("/pools")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Pools
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pool #{poolId}...</p>
        </div>
      </main>
    );
  }

  if (!pool) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">Pool Not Found</h2>
          <p className="text-gray-300 mb-4">Pool #{poolId} doesn't exist or hasn't been indexed yet.</p>
          <button
            onClick={() => router.push("/pools")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Pools
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
          {/* Back Button */}
          <button
            onClick={() => router.push("/pools")}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span> Back to Pools
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  Pool #{pool.poolId.toString()}
                </h1>
                <p className="text-gray-400">
                  Created by{" "}
                  <span className="text-purple-400 font-mono">
                    {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}
                  </span>
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl font-bold text-lg ${
                  pool.status === "OPENED"
                    ? "bg-green-500/20 text-green-400 border-2 border-green-500/50"
                    : pool.status === "ACTIVE"
                    ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50"
                    : "bg-gray-500/20 text-gray-400 border-2 border-gray-500/50"
                }`}
              >
                {pool.status === "OPENED" && "🟢 ACCEPTING PLAYERS"}
                {pool.status === "ACTIVE" && "⚔️ GAME IN PROGRESS"}
                {pool.status === "COMPLETED" && "🏆 COMPLETED"}
              </div>
            </div>

            {/* Prize Pool Highlight */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">💰 Prize Pool</p>
                  <p className="text-4xl font-black text-white">
                    {parseFloat(formatEther(pool.prizePool)).toFixed(2)} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🎟️ Entry Fee</p>
                  <p className="text-4xl font-black text-white">
                    {parseFloat(formatEther(pool.entryFee)).toFixed(2)} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">👥 Players</p>
                  <p className="text-4xl font-black text-white">
                    {pool.currentPlayers.toString()}/{pool.maxPlayers.toString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Creator View - can't join own pool */}
              {pool.status === "OPENED" && isCreator && (
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">👑</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Your Pool</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    You created this pool. Waiting for players to join...
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5 mb-4">
                    <p className="text-gray-400 text-sm mb-2">Current Players</p>
                    <p className="text-4xl font-black text-white">
                      {pool.currentPlayers.toString()}/{pool.maxPlayers.toString()}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Pool creators cannot join their own pools.
                  </p>
                </div>
              )}

              {/* Join Pool Button for OPENED pools */}
              {pool.status === "OPENED" && !isPlayerInPool && !isCreator && !joinSuccess && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Join This Pool!</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    Entry Fee: <span className="text-green-400 font-bold">{parseFloat(formatEther(pool.entryFee)).toFixed(2)} MON</span>
                  </p>
                  <p className="text-gray-400 mb-6">
                    {pool.currentPlayers.toString()}/{pool.maxPlayers.toString()} players joined
                  </p>
                  <button
                    onClick={handleJoinPool}
                    disabled={isJoining}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-5 text-2xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100"
                  >
                    {isJoining ? "⏳ Confirm in wallet..." : "🎮 Join Pool"}
                  </button>

                  {joinError && (
                    <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                      <p className="text-red-400 text-sm font-semibold">
                        ⚠️ Failed to join pool
                      </p>
                      <p className="text-red-300 text-xs mt-1">
                        {joinError.message}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Joining Success Message - shown while waiting for indexer */}
              {pool.status === "OPENED" && !isPlayerInPool && joinSuccess && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-12 text-center">
                  <div className="text-8xl mb-6 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-black text-green-400 mb-4">Successfully Joined!</h2>
                  <p className="text-gray-300 text-lg mb-4">
                    Your transaction has been confirmed on the blockchain.
                  </p>
                  <div className="flex items-center justify-center gap-3 text-yellow-400 mb-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    <p className="text-lg font-semibold">Updating pool data...</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    This usually takes 2-4 seconds. The page will update automatically.
                  </p>
                </div>
              )}

              {/* Waiting for game to start - player has joined but game not active yet */}
              {pool.status === "OPENED" && isPlayerInPool && (
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Waiting for Players...</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    You're in! The game will start when enough players join.
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5 mb-4">
                    <p className="text-gray-400 text-sm mb-2">Current Players</p>
                    <p className="text-4xl font-black text-white">
                      {pool.currentPlayers.toString()}/{pool.maxPlayers.toString()}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The game will automatically start when the pool is full or the creator activates it.
                  </p>
                </div>
              )}

              {/* Game In Progress - for non-players */}
              {pool.status === "ACTIVE" && !isPlayerInPool && (
                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Game In Progress</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    This game is currently active. Check back when it's completed to see the results!
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <p className="text-gray-400 text-sm mb-2">Players Remaining</p>
                    <p className="text-4xl font-black text-white">{players.filter(p => !p.isEliminated).length}</p>
                  </div>
                </div>
              )}

              {/* Game Completed - show results */}
              {pool.status === "COMPLETED" && pool.winner && (
                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-12 text-center">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-5xl font-black text-yellow-400 mb-4">WINNER!</h2>
                  <p className="text-2xl text-white font-bold font-mono mb-4">
                    {pool.winner.slice(0, 6)}...{pool.winner.slice(-4)}
                  </p>
                  <p className="text-xl text-gray-300 mb-6">
                    Won <span className="text-yellow-400 font-bold">{parseFloat(formatEther(pool.winnerPrize || 0n)).toFixed(2)} MON</span>
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <p className="text-gray-400 text-sm mb-2">Total Prize Pool</p>
                    <p className="text-3xl font-black text-white">{parseFloat(formatEther(pool.prizePool)).toFixed(2)} MON</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Active Players */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  👥 Players ({players.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.player.toLowerCase() === address?.toLowerCase()
                          ? "bg-purple-900/40 border border-purple-500/50"
                          : "bg-gray-900/50"
                      }`}
                    >
                      <span className="text-gray-300 font-mono text-sm">
                        {player.player.toLowerCase() === address?.toLowerCase()
                          ? "You"
                          : `${player.player.slice(0, 6)}...${player.player.slice(-4)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Rules */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📖 Game Rules</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✅ Each round: pick HEADS or TAILS</li>
                  <li>🎯 Minority choice survives</li>
                  <li>❌ Majority gets eliminated</li>
                  <li>🏆 Last player wins 88% of pool</li>
                  <li>💰 Creator earns 12% royalty</li>
                </ul>
              </div>

              {/* Pool Stats */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Pool Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Players</span>
                    <span className="text-white font-bold">{pool.currentPlayers.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slots Available</span>
                    <span className="text-green-400 font-bold">
                      {(Number(pool.maxPlayers) - Number(pool.currentPlayers))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
