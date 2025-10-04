"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";

type PoolStatus = "active" | "ongoing" | "completed";
type Choice = "heads" | "tails" | null;

interface Player {
  address: string;
  choice: Choice;
  isEliminated: boolean;
  round: number;
}

interface Round {
  roundNumber: number;
  headsCount: number;
  tailsCount: number;
  eliminatedPlayers: string[];
  winningChoice: Choice;
}

interface PoolDetail {
  id: string;
  creator: string;
  entryFee: string;
  currentPlayers: number;
  maxPlayers: number;
  prizePool: string;
  status: PoolStatus;
  currentRound: number;
  players: Player[];
  rounds: Round[];
  winner: string | null;
  createdAt: number;
}

export default function PoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [selectedChoice, setSelectedChoice] = useState<Choice>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const poolId = params.id as string;

  // TODO: Replace with actual blockchain data fetching
  const mockPoolDetail: PoolDetail = {
    id: poolId,
    creator: "0x1234...5678",
    entryFee: "1",
    currentPlayers: 8,
    maxPlayers: 10,
    prizePool: "8.8",
    status: "active",
    currentRound: 0,
    players: [
      { address: "0xaaa1...1111", choice: null, isEliminated: false, round: 0 },
      { address: "0xbbb2...2222", choice: null, isEliminated: false, round: 0 },
      { address: "0xccc3...3333", choice: null, isEliminated: false, round: 0 },
      { address: "0xddd4...4444", choice: null, isEliminated: false, round: 0 },
      { address: "0xeee5...5555", choice: null, isEliminated: false, round: 0 },
      { address: "0xfff6...6666", choice: null, isEliminated: false, round: 0 },
      { address: "0x1117...7777", choice: null, isEliminated: false, round: 0 },
      { address: "0x2228...8888", choice: null, isEliminated: false, round: 0 },
    ],
    rounds: [],
    winner: null,
    createdAt: Date.now() - 3600000,
  };

  const [pool, setPool] = useState<PoolDetail>(mockPoolDetail);

  const isPlayerInPool = pool.players.some((p) => p.address === address);
  const currentPlayer = pool.players.find((p) => p.address === address);
  const activePlayers = pool.players.filter((p) => !p.isEliminated);

  const handleJoinPool = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log("Joining pool:", poolId);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate transaction
      alert("Successfully joined pool!");
      router.refresh();
    } catch (error) {
      console.error("Error joining pool:", error);
      alert("Failed to join pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChoice = async () => {
    if (!selectedChoice) {
      alert("Please select HEADS or TAILS!");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log("Submitting choice:", selectedChoice);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate transaction
      alert(`Choice submitted: ${selectedChoice.toUpperCase()}`);
      setSelectedChoice(null);
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

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  Pool #{pool.id}
                </h1>
                <p className="text-gray-400">
                  Created by{" "}
                  <span className="text-purple-400 font-mono">{pool.creator}</span>
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl font-bold text-lg ${
                  pool.status === "active"
                    ? "bg-green-500/20 text-green-400 border-2 border-green-500/50"
                    : pool.status === "ongoing"
                    ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50"
                    : "bg-gray-500/20 text-gray-400 border-2 border-gray-500/50"
                }`}
              >
                {pool.status === "active" && "🟢 ACCEPTING PLAYERS"}
                {pool.status === "ongoing" && "⚔️ GAME IN PROGRESS"}
                {pool.status === "completed" && "🏆 COMPLETED"}
              </div>
            </div>

            {/* Prize Pool Highlight */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">💰 Prize Pool</p>
                  <p className="text-4xl font-black text-white">
                    {pool.prizePool} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">🎟️ Entry Fee</p>
                  <p className="text-4xl font-black text-white">
                    {pool.entryFee} <span className="text-xl text-gray-400">MON</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-medium mb-2">👥 Players</p>
                  <p className="text-4xl font-black text-white">
                    {pool.currentPlayers}/{pool.maxPlayers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Join Pool / Make Choice */}
              {pool.status === "active" && !isPlayerInPool && (
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4">🎮 Join This Pool</h2>
                  <p className="text-gray-300 mb-6">
                    Entry Fee: <span className="text-white font-bold">{pool.entryFee} MON</span>
                  </p>
                  <button
                    onClick={handleJoinPool}
                    disabled={isSubmitting || !isConnected}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "⏳ Joining..." : "🎯 Join Pool"}
                  </button>
                </div>
              )}

              {pool.status === "ongoing" && isPlayerInPool && !currentPlayer?.isEliminated && (
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    🎯 Round {pool.currentRound + 1}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Choose HEADS or TAILS. The <span className="text-green-400 font-bold">minority</span> survives!
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedChoice("heads")}
                      className={`py-8 rounded-xl text-2xl font-bold transition-all ${
                        selectedChoice === "heads"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105 ring-4 ring-blue-400"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      🪙 HEADS
                    </button>
                    <button
                      onClick={() => setSelectedChoice("tails")}
                      className={`py-8 rounded-xl text-2xl font-bold transition-all ${
                        selectedChoice === "tails"
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-105 ring-4 ring-purple-400"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      🎲 TAILS
                    </button>
                  </div>

                  <button
                    onClick={handleSubmitChoice}
                    disabled={!selectedChoice || isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "⏳ Submitting..." : "✅ Submit Choice"}
                  </button>
                </div>
              )}

              {pool.status === "completed" && pool.winner && (
                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-black text-yellow-400 mb-4">
                    WINNER!
                  </h2>
                  <p className="text-2xl text-white font-bold font-mono mb-4">
                    {pool.winner}
                  </p>
                  <p className="text-xl text-gray-300">
                    Won <span className="text-yellow-400 font-bold">{pool.prizePool} MON</span>
                  </p>
                </div>
              )}

              {/* Round History */}
              {pool.rounds.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">📜 Round History</h3>
                  <div className="space-y-4">
                    {pool.rounds.map((round) => (
                      <div
                        key={round.roundNumber}
                        className="bg-gray-900/50 border border-gray-600 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">Round {round.roundNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            round.winningChoice === "heads"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}>
                            {round.winningChoice === "heads" ? "🪙 HEADS" : "🎲 TAILS"} Won
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>🪙 Heads: {round.headsCount} players</p>
                          <p>🎲 Tails: {round.tailsCount} players</p>
                          <p className="text-red-400">
                            ❌ Eliminated: {round.eliminatedPlayers.length} players
                          </p>
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
                  👥 Active Players ({activePlayers.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activePlayers.map((player) => (
                    <div
                      key={player.address}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.address === address
                          ? "bg-purple-900/40 border border-purple-500/50"
                          : "bg-gray-900/50"
                      }`}
                    >
                      <span className="text-gray-300 font-mono text-sm">
                        {player.address === address ? "You" : player.address}
                      </span>
                      {player.choice && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          ✓
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
                    <span className="text-gray-400">Current Round</span>
                    <span className="text-white font-bold">{pool.currentRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eliminated</span>
                    <span className="text-red-400 font-bold">
                      {pool.players.filter((p) => p.isEliminated).length}
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
