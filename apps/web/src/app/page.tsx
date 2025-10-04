"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";

export default function Home() {
  const router = useRouter();
  const { isMiniAppReady } = useMiniApp();
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const [demoStep, setDemoStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  // Auto-connect wallet when miniapp is ready
  useEffect(() => {
    if (
      isMiniAppReady &&
      !isConnected &&
      !isConnecting &&
      connectors.length > 0
    ) {
      const farcasterConnector = connectors.find((c) => c.id === "frameWallet");
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
    }
  }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);

  // Demo animation steps
  const demoSteps = [
    { text: "10 players enter - Prize Pool: 10 MON", players: 10, eliminated: 0 },
    { text: "Round 1: 3 pick HEADS (minority), 7 pick TAILS", players: 10, eliminated: 0, choice: "Minority wins!" },
    { text: "7 players eliminated! 3 advance", players: 3, eliminated: 7 },
    { text: "Round 2: 1 picks HEADS (minority), 2 pick TAILS", players: 3, eliminated: 7, choice: "Minority wins!" },
    { text: "🎉 LAST MONAD STANDING! Winner takes 8.8 MON!", players: 1, eliminated: 9, winner: true },
  ];

  useEffect(() => {
    if (showDemo) {
      const interval = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % demoSteps.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [showDemo, demoSteps.length]);

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
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="px-4 py-20 md:py-32">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-10">
                {/* Jackpot Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50 rounded-full px-6 py-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-yellow-300 font-semibold">Winner Takes All Jackpot</span>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight">
                    Be The
                    <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent animate-gradient">
                      LAST MONAD
                    </span>
                    <span className="block text-3xl md:text-5xl text-purple-400 mt-4">Standing</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Think different. Choose opposite. Survive elimination rounds.
                    <span className="block text-yellow-400 font-bold mt-2">Last player wins the entire jackpot! 🏆</span>
                  </p>
                </div>

                {/* Game Concept Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-white mb-3">Choose Wisely</h3>
                    <p className="text-gray-300">
                      Each round: HEADS or TAILS. The minority choice survives. Majority gets eliminated.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-900/40 to-red-900/20 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4">⚔️</div>
                    <h3 className="text-2xl font-bold text-white mb-3">Survive Rounds</h3>
                    <p className="text-gray-300">
                      Outlast opponents through strategic minority picks. Each round eliminates the majority.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-900/20 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4">💎</div>
                    <h3 className="text-2xl font-bold text-white mb-3">Win Jackpot</h3>
                    <p className="text-gray-300">
                      Last survivor takes 88% of prize pool. Instant payout to your wallet!</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16">
                  <button
                    onClick={() => router.push("/pools")}
                    className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-5 text-xl font-bold rounded-xl shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
                  >
                    <span className="relative z-10">🎮 Play Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                  </button>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="bg-gray-800 border-2 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 px-12 py-5 text-xl font-bold rounded-xl transition-all hover:scale-105"
                  >
                    📖 How It Works
                  </button>
                </div>

                {/* Creator Incentive */}
                <div className="max-w-4xl mx-auto mt-20">
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                      <span>🎨</span>
                      Create Pools & Earn 12% Royalty
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2">
                        <p className="text-green-200">
                          <strong>💰 Stake 2 MON</strong> → Create 1 pool
                        </p>
                        <p className="text-green-200">
                          <strong>🎁 Earn 12%</strong> of every completed pool's jackpot
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-emerald-200">
                          <strong>📈 Scale Up</strong> → Stake 200 MON for 100 pools
                        </p>
                        <p className="text-emerald-200">
                          <strong>🔐 Smart Accounts</strong> → Secure & instant payouts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Demo Modal */}
          {showDemo && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 max-w-3xl w-full shadow-2xl shadow-purple-500/50">
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">🎮 How LastMonad Works</h2>
                    <button
                      onClick={() => setShowDemo(false)}
                      className="text-gray-400 hover:text-white text-3xl font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-blue-900/40 border border-blue-500/50 rounded-xl p-6">
                    <p className="text-blue-200 text-lg leading-relaxed">
                      <strong className="text-yellow-400">Game Rule:</strong> Each round, pick HEADS or TAILS.
                      The <strong className="text-green-400">minority</strong> survives,
                      the <strong className="text-red-400">majority</strong> is eliminated.
                      Last player standing wins the entire jackpot!
                    </p>
                  </div>

                  {/* Demo Animation */}
                  <div className="bg-gray-800 rounded-xl p-8">
                    <div className="text-center space-y-6">
                      <p className="text-2xl text-white font-bold">
                        {demoSteps[demoStep].text}
                      </p>

                      {/* Visual Players */}
                      <div className="flex justify-center gap-3 flex-wrap min-h-[80px] items-center">
                        {[...Array(demoSteps[demoStep].players)].map((_, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-green-500/50 animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            ✓
                          </div>
                        ))}
                        {[...Array(demoSteps[demoStep].eliminated)].map((_, i) => (
                          <div
                            key={`elim-${i}`}
                            className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-xl font-bold opacity-40"
                          >
                            ✕
                          </div>
                        ))}
                      </div>

                      {demoSteps[demoStep].choice && (
                        <p className="text-xl text-yellow-400 font-bold animate-pulse">
                          💡 {demoSteps[demoStep].choice}
                        </p>
                      )}

                      {demoSteps[demoStep].winner && (
                        <div className="space-y-4 py-6">
                          <p className="text-4xl font-black text-yellow-400 animate-bounce">
                            🎉 JACKPOT WINNER! 🎉
                          </p>
                          <p className="text-2xl text-green-400 font-bold">
                            Takes home 8.8 MON!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button
                      onClick={() => {
                        setShowDemo(false);
                        router.push("/pools");
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl"
                    >
                      🎮 Start Playing →
                    </button>
                    <button
                      onClick={() => setShowDemo(false)}
                      className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg font-bold rounded-xl"
                    >
                      Got It!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
