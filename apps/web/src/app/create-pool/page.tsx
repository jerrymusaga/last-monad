"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";
import { parseEther } from "viem";

export default function CreatePoolPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();

  const [entryFee, setEntryFee] = useState("1");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Replace with actual blockchain data
  const creatorStake = "2"; // MON
  const hasStaked = false; // Check if user has staked

  const calculatePrizePool = () => {
    const fee = parseFloat(entryFee) || 0;
    const players = parseInt(maxPlayers) || 0;
    const totalPool = fee * players;
    const creatorReward = totalPool * 0.12; // 12% creator reward
    const winnerPrize = totalPool * 0.88; // 88% to winner
    return { totalPool, creatorReward, winnerPrize };
  };

  const { totalPool, creatorReward, winnerPrize } = calculatePrizePool();

  const handleCreatePool = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!hasStaked) {
      alert("You need to stake 2 MON to create pools!");
      router.push("/stake");
      return;
    }

    if (parseFloat(entryFee) < 1 || parseFloat(entryFee) > 200) {
      alert("Entry fee must be between 1 and 200 MON");
      return;
    }

    if (parseInt(maxPlayers) < 2 || parseInt(maxPlayers) > 100) {
      alert("Max players must be between 2 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log("Creating pool:", { entryFee, maxPlayers, description });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate transaction
      alert("Pool created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating pool:", error);
      alert("Failed to create pool");
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

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Wallet Required</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to create a pool
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

        <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => router.push("/pools")}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span> Back to Pools
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              🎨 Create Pool
            </h1>
            <p className="text-xl text-gray-300">
              Configure your game and earn 12% royalty on completion!
            </p>
          </div>

          {/* Staking Requirement Notice */}
          {!hasStaked && (
            <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                    Staking Required
                  </h3>
                  <p className="text-gray-300 mb-4">
                    You need to stake <span className="text-white font-bold">2 MON</span> to
                    create pools. This ensures creator commitment and unlocks your earning
                    potential!
                  </p>
                  <button
                    onClick={() => router.push("/stake")}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Stake Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Form */}
            <div className="bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-6">⚙️ Pool Configuration</h2>

              <div className="space-y-6">
                {/* Entry Fee */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    💰 Entry Fee (MON)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    step="0.1"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1.0"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Min: 1 MON | Max: 200 MON
                  </p>
                </div>

                {/* Max Players */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    👥 Maximum Players
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Min: 2 players | Max: 100 players
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    ⚡ Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setEntryFee("1");
                        setMaxPlayers("10");
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      🎮 Casual
                      <br />
                      <span className="text-xs text-gray-300">1 MON • 10 Players</span>
                    </button>
                    <button
                      onClick={() => {
                        setEntryFee("5");
                        setMaxPlayers("20");
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      🔥 Competitive
                      <br />
                      <span className="text-xs text-gray-300">5 MON • 20 Players</span>
                    </button>
                    <button
                      onClick={() => {
                        setEntryFee("10");
                        setMaxPlayers("50");
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      💎 High Stakes
                      <br />
                      <span className="text-xs text-gray-300">10 MON • 50 Players</span>
                    </button>
                    <button
                      onClick={() => {
                        setEntryFee("20");
                        setMaxPlayers("100");
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      👑 Whale
                      <br />
                      <span className="text-xs text-gray-300">20 MON • 100 Players</span>
                    </button>
                  </div>
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    📝 Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add a description for your pool..."
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {description.length}/200 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6">👁️ Pool Preview</h2>

                <div className="space-y-4">
                  {/* Total Prize Pool */}
                  <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-xl p-5">
                    <p className="text-yellow-400 text-sm font-medium mb-2">
                      💰 Total Prize Pool
                    </p>
                    <p className="text-4xl font-black text-white">
                      {totalPool.toFixed(2)}{" "}
                      <span className="text-xl text-gray-400">MON</span>
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-gray-800/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                      <span className="text-gray-300">🏆 Winner Gets</span>
                      <span className="text-green-400 font-bold text-lg">
                        {winnerPrize.toFixed(2)} MON
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                      <span className="text-gray-300">🎨 Your Royalty (12%)</span>
                      <span className="text-purple-400 font-bold text-lg">
                        {creatorReward.toFixed(2)} MON
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                      <span className="text-gray-300">🎟️ Entry Fee</span>
                      <span className="text-white font-bold">{entryFee} MON</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">👥 Max Players</span>
                      <span className="text-white font-bold">{maxPlayers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Benefits */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">✨ Creator Benefits</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Earn <span className="text-white font-bold">12% royalty</span> when pool completes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>No additional fees or gas costs for players joining</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Your pool appears in the global pool list</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Automatic royalty distribution on completion</span>
                  </li>
                </ul>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreatePool}
                disabled={isSubmitting || !hasStaked}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-5 text-xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "⏳ Creating Pool..." : "🚀 Create Pool"}
              </button>

              {!hasStaked && (
                <p className="text-center text-yellow-400 text-sm">
                  ⚠️ You must stake 2 MON before creating pools
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
