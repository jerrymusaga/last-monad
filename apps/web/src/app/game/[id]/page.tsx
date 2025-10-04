"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";

type Choice = "heads" | "tails" | null;
type GameStatus = "waiting" | "active" | "completed";

interface Player {
  address: string;
  choice: Choice;
  isEliminated: boolean;
  eliminatedInRound: number | null;
}

interface RoundResult {
  roundNumber: number;
  headsCount: number;
  tailsCount: number;
  winningChoice: Choice;
  eliminatedCount: number;
}

interface GameData {
  id: string;
  creator: string;
  entryFee: string;
  totalPlayers: number;
  maxPlayers: number;
  prizePool: string;
  status: GameStatus;
  currentRound: number;
  players: Player[];
  roundHistory: RoundResult[];
  winner: string | null;
  winnerPrize: string | null;
}

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [selectedChoice, setSelectedChoice] = useState<Choice>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per round

  const gameId = params.id as string;

  // TODO: Replace with actual blockchain data
  const mockGame: GameData = {
    id: gameId,
    creator: "0x1234...5678",
    entryFee: "1",
    totalPlayers: 8,
    maxPlayers: 10,
    prizePool: "8.8",
    status: "active",
    currentRound: 2,
    players: [
      {
        address: address || "0xaaa1...1111",
        choice: null,
        isEliminated: false,
        eliminatedInRound: null,
      },
      { address: "0xbbb2...2222", choice: "heads", isEliminated: false, eliminatedInRound: null },
      { address: "0xccc3...3333", choice: "tails", isEliminated: false, eliminatedInRound: null },
      { address: "0xddd4...4444", choice: null, isEliminated: false, eliminatedInRound: null },
      { address: "0xeee5...5555", choice: "heads", isEliminated: true, eliminatedInRound: 1 },
      { address: "0xfff6...6666", choice: "tails", isEliminated: true, eliminatedInRound: 1 },
      { address: "0x1117...7777", choice: "heads", isEliminated: true, eliminatedInRound: 1 },
      { address: "0x2228...8888", choice: "tails", isEliminated: true, eliminatedInRound: 1 },
    ],
    roundHistory: [
      {
        roundNumber: 1,
        headsCount: 5,
        tailsCount: 3,
        winningChoice: "tails",
        eliminatedCount: 5,
      },
    ],
    winner: null,
    winnerPrize: null,
  };

  const [game, setGame] = useState<GameData>(mockGame);

  const currentPlayer = game.players.find((p) => p.address === address);
  const activePlayers = game.players.filter((p) => !p.isEliminated);
  const isPlayerInGame = !!currentPlayer;
  const hasSubmittedChoice = currentPlayer?.choice !== null;

  // Timer countdown
  useEffect(() => {
    if (game.status !== "active") return;

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
  }, [game.status]);

  const handleSubmitChoice = async () => {
    if (!selectedChoice) {
      alert("Please select HEADS or TAILS!");
      return;
    }

    if (!isConnected || !isPlayerInGame) {
      alert("You must be in this game to make a choice!");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log("Submitting choice:", selectedChoice);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Choice submitted: ${selectedChoice.toUpperCase()}`);
      setSelectedChoice(null);
      // TODO: Refresh game data
    } catch (error) {
      console.error("Error submitting choice:", error);
      alert("Failed to submit choice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMiniAppReady) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                  🎮 Game #{game.id}
                </h1>
                <p className="text-gray-400">
                  Round <span className="text-purple-400 font-bold">{game.currentRound}</span>
                </p>
              </div>

              {game.status === "active" && (
                <div className="bg-blue-900/40 border-2 border-blue-500/50 rounded-xl p-4 text-center">
                  <p className="text-blue-400 text-sm font-medium mb-1">⏰ Time Left</p>
                  <p className="text-4xl font-black text-white">{timeLeft}s</p>
                </div>
              )}

              {game.status === "completed" && game.winner && (
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
                    {game.prizePool} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">👥 Players Alive</p>
                  <p className="text-4xl font-black text-white">{activePlayers.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🎯 Entry Fee</p>
                  <p className="text-4xl font-black text-white">
                    {game.entryFee} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Winner Display */}
              {game.status === "completed" && game.winner && (
                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-12 text-center animate-pulse">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-5xl font-black text-yellow-400 mb-4">WINNER!</h2>
                  <p className="text-2xl text-white font-bold font-mono mb-4">{game.winner}</p>
                  <p className="text-xl text-gray-300">
                    Won <span className="text-yellow-400 font-bold">{game.winnerPrize} MON</span>
                  </p>
                  {game.winner === address && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="mt-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all hover:scale-105"
                    >
                      💰 Claim Prize
                    </button>
                  )}
                </div>
              )}

              {/* Choice Selection */}
              {game.status === "active" &&
                isPlayerInGame &&
                !currentPlayer?.isEliminated &&
                !hasSubmittedChoice && (
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
                      disabled={!selectedChoice || isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-5 text-2xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSubmitting ? "⏳ Submitting..." : "✅ Lock In Choice"}
                    </button>
                  </div>
                )}

              {/* Waiting for Choice Submission */}
              {game.status === "active" &&
                isPlayerInGame &&
                !currentPlayer?.isEliminated &&
                hasSubmittedChoice && (
                  <div className="bg-green-900/30 border-2 border-green-500/50 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4 animate-bounce">✅</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-2">
                      Choice Submitted!
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Waiting for other players to make their choices...
                    </p>
                  </div>
                )}

              {/* Eliminated Message */}
              {isPlayerInGame && currentPlayer?.isEliminated && (
                <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-2">You Were Eliminated</h3>
                  <p className="text-gray-300 text-lg">
                    Better luck next time! You were eliminated in Round{" "}
                    {currentPlayer.eliminatedInRound}.
                  </p>
                </div>
              )}

              {/* Round History */}
              {game.roundHistory.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">📜 Round History</h3>
                  <div className="space-y-4">
                    {game.roundHistory.map((round) => (
                      <div
                        key={round.roundNumber}
                        className="bg-gray-900/50 border border-gray-600 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-bold text-lg">
                            Round {round.roundNumber}
                          </span>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold ${
                              round.winningChoice === "heads"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                : "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                            }`}
                          >
                            {round.winningChoice === "heads" ? "🪙 HEADS" : "🎲 TAILS"} Won
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">🪙 Heads</p>
                            <p className="text-white font-bold">{round.headsCount} players</p>
                          </div>
                          <div>
                            <p className="text-gray-400">🎲 Tails</p>
                            <p className="text-white font-bold">{round.tailsCount} players</p>
                          </div>
                          <div>
                            <p className="text-gray-400">❌ Eliminated</p>
                            <p className="text-red-400 font-bold">{round.eliminatedCount}</p>
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
                  {game.players.map((player) => (
                    <div
                      key={player.address}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.address === address
                          ? "bg-purple-900/40 border border-purple-500/50"
                          : player.isEliminated
                          ? "bg-red-900/20 opacity-50"
                          : "bg-gray-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {player.isEliminated ? "💀" : "✅"}
                        <span className="text-gray-300 font-mono text-sm">
                          {player.address === address ? "You" : player.address}
                        </span>
                      </div>
                      {!player.isEliminated && player.choice && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded font-semibold">
                          Locked
                        </span>
                      )}
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
                    <span className="text-white font-bold">{game.currentRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Players</span>
                    <span className="text-white font-bold">{game.totalPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eliminated</span>
                    <span className="text-red-400 font-bold">
                      {game.players.filter((p) => p.isEliminated).length}
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
