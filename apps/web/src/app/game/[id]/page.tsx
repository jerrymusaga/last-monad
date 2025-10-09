"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useEnvioGameDetails } from "@/hooks/envio";
import { formatEther } from "viem";
import {
  useJoinPool,
  useMakeSelection,
  useClaimPrize,
  usePlayerChoice,
} from "@/hooks/use-last-monad";
import { PlayerChoice } from "@/contracts/config";

type Choice = "heads" | "tails" | null;

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [selectedChoice, setSelectedChoice] = useState<Choice>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per round

  const gameId = params.id as string;
  const poolId = BigInt(gameId);

  // Fetch game data from Envio
  const { data: gameData, isLoading, refetch: refetchGame } = useEnvioGameDetails(gameId);

  // Contract write hooks
  const { joinPool, isPending: isJoining, isSuccess: joinSuccess, error: joinError } = useJoinPool();
  const { makeSelection, isPending: isSelecting, isSuccess: selectionSuccess, error: selectionError } = useMakeSelection();
  const { claimPrize, isPending: isClaiming, isSuccess: claimSuccess, error: claimError } = useClaimPrize();
  const { choice: playerChoice, refetch: refetchChoice } = usePlayerChoice(poolId, address);

  const game = useMemo(() => {
    if (!gameData || !gameData.Pool[0]) return null;
    return gameData.Pool[0];
  }, [gameData]);

  const players = gameData?.Player || [];
  const rounds = gameData?.Round || [];

  const currentPlayer = players.find((p) => p.player.toLowerCase() === address?.toLowerCase());
  const activePlayers = players.filter((p) => !p.isEliminated);
  const isPlayerInGame = !!currentPlayer;
  const currentRound = rounds.length > 0 ? Number(rounds[rounds.length - 1].round) : 1;
  const hasSubmittedChoice = playerChoice !== undefined && playerChoice !== PlayerChoice.NONE;

  // Timer countdown
  useEffect(() => {
    if (game?.status !== "ACTIVE") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // TODO: Trigger round completion
          return 30; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.status]);

  // Handle successful actions with polling for indexer
  useEffect(() => {
    if (joinSuccess || selectionSuccess || claimSuccess) {
      // Immediate refetch
      refetchGame();
      refetchChoice();

      // Poll a few more times to ensure indexer has caught up
      const pollInterval = setInterval(() => {
        refetchGame();
        refetchChoice();
      }, 2000); // Every 2 seconds

      // Stop polling after 10 seconds
      setTimeout(() => clearInterval(pollInterval), 10000);

      return () => clearInterval(pollInterval);
    }
  }, [joinSuccess, selectionSuccess, claimSuccess, refetchGame, refetchChoice]);

  const handleJoinPool = async () => {
    if (!isConnected || !address || !game) {
      return;
    }

    try {
      joinPool(poolId, game.entryFee);
    } catch (error) {
      console.error("Error joining pool:", error);
    }
  };

  const handleSubmitChoice = async () => {
    if (!selectedChoice) {
      return;
    }

    if (!isConnected || !isPlayerInGame) {
      return;
    }

    try {
      const choice = selectedChoice === "heads" ? PlayerChoice.HEADS : PlayerChoice.TAILS;
      makeSelection(poolId, choice);
      setSelectedChoice(null);
    } catch (error) {
      console.error("Error submitting choice:", error);
    }
  };

  const handleClaimPrize = async () => {
    if (!isConnected || !address) {
      return;
    }

    try {
      claimPrize(poolId);
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  if (!isMiniAppReady || isLoading || !game) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading game...</p>
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

          {/* Game Header */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  🎮 Game #{game.poolId.toString()}
                </h1>
                <p className="text-gray-400">
                  Round <span className="text-purple-400 font-bold">{currentRound}</span>
                </p>
              </div>

              {game.status === "ACTIVE" && (
                <div className="bg-blue-900/40 border-2 border-blue-500/50 rounded-xl p-4 text-center">
                  <p className="text-blue-400 text-sm font-medium mb-1">⏰ Time Left</p>
                  <p className="text-4xl font-black text-white">{timeLeft}s</p>
                </div>
              )}

              {game.status === "COMPLETED" && game.winner && (
                <div className="bg-yellow-900/40 border-2 border-yellow-500/50 rounded-xl px-6 py-3">
                  <p className="text-yellow-400 font-bold text-lg">🏆 Game Complete!</p>
                </div>
              )}
            </div>

            {/* Prize Pool */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">💰 Prize Pool</p>
                  <p className="text-4xl font-black text-white">
                    {parseFloat(formatEther(game.prizePool)).toFixed(2)} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">👥 Players Alive</p>
                  <p className="text-4xl font-black text-white">{activePlayers.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🎯 Entry Fee</p>
                  <p className="text-4xl font-black text-white">
                    {parseFloat(formatEther(game.entryFee)).toFixed(2)} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Winner Display */}
              {game.status === "COMPLETED" && game.winner && (
                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-12 text-center animate-pulse">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-5xl font-black text-yellow-400 mb-4">WINNER!</h2>
                  <p className="text-2xl text-white font-bold font-mono mb-4">{game.winner}</p>
                  <p className="text-xl text-gray-300">
                    Won <span className="text-yellow-400 font-bold">{parseFloat(formatEther(game.winnerPrize || 0n)).toFixed(2)} MON</span>
                  </p>
                  {game.winner.toLowerCase() === address?.toLowerCase() && (
                    <>
                      <button
                        onClick={handleClaimPrize}
                        disabled={isClaiming}
                        className="mt-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100"
                      >
                        {isClaiming ? "⏳ Claiming..." : "💰 Claim Prize"}
                      </button>

                      {claimError && (
                        <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                          <p className="text-red-400 text-sm font-semibold">
                            ⚠️ Failed to claim prize
                          </p>
                          <p className="text-red-300 text-xs mt-1">
                            {claimError.message}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Join Pool Button for OPENED pools */}
              {game.status === "OPENED" && !isPlayerInGame && !joinSuccess && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Join This Pool!</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    Entry Fee: <span className="text-green-400 font-bold">{parseFloat(formatEther(game.entryFee)).toFixed(2)} MON</span>
                  </p>
                  <p className="text-gray-400 mb-6">
                    {game.currentPlayers.toString()}/{game.maxPlayers.toString()} players joined
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
              {game.status === "OPENED" && !isPlayerInGame && joinSuccess && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-12 text-center">
                  <div className="text-8xl mb-6 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-black text-green-400 mb-4">Successfully Joined!</h2>
                  <p className="text-gray-300 text-lg mb-4">
                    Your transaction has been confirmed on the blockchain.
                  </p>
                  <div className="flex items-center justify-center gap-3 text-yellow-400 mb-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    <p className="text-lg font-semibold">Updating game data...</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    This usually takes 2-4 seconds. The page will update automatically.
                  </p>
                </div>
              )}

              {/* Waiting for game to start - player has joined but game not active yet */}
              {game.status === "OPENED" && isPlayerInGame && (
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Waiting for Players...</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    You're in! The game will start when enough players join.
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5 mb-4">
                    <p className="text-gray-400 text-sm mb-2">Current Players</p>
                    <p className="text-4xl font-black text-white">
                      {game.currentPlayers.toString()}/{game.maxPlayers.toString()}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The game will automatically start when the pool is full or the creator activates it.
                  </p>
                </div>
              )}

              {/* Choice Selection */}
              {game.status === "ACTIVE" &&
                isPlayerInGame &&
                !currentPlayer?.isEliminated && (
                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      🎯 Make Your Choice
                    </h2>
                    <p className="text-gray-300 mb-6 text-lg">
                      Choose wisely! The <span className="text-green-400 font-bold">minority</span>{" "}
                      survives this round.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <button
                        onClick={() => setSelectedChoice("heads")}
                        className={`group relative overflow-hidden py-12 rounded-2xl text-3xl font-black transition-all ${
                          selectedChoice === "heads"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105 ring-4 ring-blue-400 shadow-2xl"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-102"
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-6xl mb-3">🪙</div>
                          HEADS
                        </div>
                        {selectedChoice === "heads" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedChoice("tails")}
                        className={`group relative overflow-hidden py-12 rounded-2xl text-3xl font-black transition-all ${
                          selectedChoice === "tails"
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-105 ring-4 ring-purple-400 shadow-2xl"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-102"
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-6xl mb-3">🎲</div>
                          TAILS
                        </div>
                        {selectedChoice === "tails" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 animate-pulse"></div>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleSubmitChoice}
                      disabled={!selectedChoice || isSelecting || hasSubmittedChoice}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-5 text-2xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSelecting ? "⏳ Submitting..." : hasSubmittedChoice ? "✅ Choice Locked" : "✅ Lock In Choice"}
                    </button>

                    {selectionError && (
                      <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400 text-sm font-semibold">
                          ⚠️ Failed to submit choice
                        </p>
                        <p className="text-red-300 text-xs mt-1">
                          {selectionError.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Eliminated Message */}
              {isPlayerInGame && currentPlayer?.isEliminated && (
                <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-2">You Were Eliminated</h3>
                  <p className="text-gray-300 text-lg">
                    Better luck next time! You were eliminated in Round{" "}
                    {currentPlayer.eliminatedInRound?.toString()}.
                  </p>
                  <p className="text-gray-400 text-sm mt-4">
                    Keep watching to see who wins!
                  </p>
                </div>
              )}

              {/* Spectator Mode - for non-players watching active games */}
              {game.status === "ACTIVE" && !isPlayerInGame && (
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">👁️</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Spectator Mode</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    You're watching this game. Only players who joined before it started can participate.
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <p className="text-gray-400 text-sm mb-2">Current Round</p>
                    <p className="text-4xl font-black text-white">{currentRound}</p>
                    <p className="text-gray-400 text-sm mt-4">
                      {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </div>
              )}

              {/* Round History */}
              {rounds.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">📜 Round History</h3>
                  <div className="space-y-4">
                    {rounds.map((round) => (
                      <div
                        key={round.id}
                        className="bg-gray-900/50 border border-gray-600 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-bold text-lg">
                            Round {round.round.toString()}
                          </span>
                          {round.isRepeated ? (
                            <span className="px-4 py-2 rounded-full text-sm font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                              🔄 Repeated (Choice: {round.unanimousChoice?.toString()})
                            </span>
                          ) : round.winningChoice !== undefined && (
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-bold ${
                                round.winningChoice === 0n
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                  : "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                              }`}
                            >
                              {round.winningChoice === 0n ? "🪙 HEADS" : "🎲 TAILS"} Won
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">❌ Eliminated</p>
                            <p className="text-red-400 font-bold">{round.eliminatedCount.toString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">✅ Remaining</p>
                            <p className="text-green-400 font-bold">{round.remainingCount.toString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Active Players */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  👥 Players ({activePlayers.length} alive)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.player.toLowerCase() === address?.toLowerCase()
                          ? "bg-purple-900/40 border border-purple-500/50"
                          : player.isEliminated
                          ? "bg-red-900/20 opacity-50"
                          : "bg-gray-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {player.isEliminated ? "💀" : "✅"}
                        <span className="text-gray-300 font-mono text-sm">
                          {player.player.toLowerCase() === address?.toLowerCase()
                            ? "You"
                            : `${player.player.slice(0, 6)}...${player.player.slice(-4)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Rules */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📖 Game Rules</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✅ Choose HEADS or TAILS each round</li>
                  <li>🎯 Minority choice survives</li>
                  <li>❌ Majority gets eliminated</li>
                  <li>⏰ 30 seconds per round</li>
                  <li>🏆 Last player wins 88% of pool</li>
                  <li>💰 Creator earns 12% royalty</li>
                </ul>
              </div>

              {/* Game Stats */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Round</span>
                    <span className="text-white font-bold">{currentRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Players</span>
                    <span className="text-white font-bold">{game.currentPlayers.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eliminated</span>
                    <span className="text-red-400 font-bold">
                      {players.filter((p) => p.isEliminated).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-green-400 font-bold">{activePlayers.length}</span>
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
