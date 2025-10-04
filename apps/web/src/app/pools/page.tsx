"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";

type PoolStatus = "active" | "ongoing" | "completed";

interface Pool {
  id: string;
  creator: string;
  entryFee: string;
  currentPlayers: number;
  maxPlayers: number;
  prizePool: string;
  status: PoolStatus;
  createdAt: number;
}

export default function PoolsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PoolStatus | "all">("all");

  // TODO: Replace with actual blockchain data fetching
  const mockPools: Pool[] = [
    {
      id: "1",
      creator: "0x1234...5678",
      entryFee: "1",
      currentPlayers: 8,
      maxPlayers: 10,
      prizePool: "8",
      status: "active",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "2",
      creator: "0xabcd...efgh",
      entryFee: "2",
      currentPlayers: 15,
      maxPlayers: 20,
      prizePool: "30",
      status: "ongoing",
      createdAt: Date.now() - 7200000,
    },
    {
      id: "3",
      creator: "0x9876...4321",
      entryFee: "1",
      currentPlayers: 10,
      maxPlayers: 10,
      prizePool: "8.8",
      status: "completed",
      createdAt: Date.now() - 86400000,
    },
  ];

  const filteredPools = mockPools.filter((pool) => {
    const matchesSearch =
      pool.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.id.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || pool.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PoolStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "ongoing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusEmoji = (status: PoolStatus) => {
    switch (status) {
      case "active":
        return "🟢";
      case "ongoing":
        return "⚔️";
      case "completed":
        return "🏆";
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
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              🎮 Game Pools
            </h1>
            <p className="text-xl text-gray-300">
              Join a pool, survive the rounds, win the jackpot!
            </p>
          </div>

          {/* Stats Header */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <p className="text-4xl font-black text-green-400 mb-2">
                {mockPools.filter((p) => p.status === "active").length}
              </p>
              <p className="text-gray-400">🟢 Active Pools</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <p className="text-4xl font-black text-yellow-400 mb-2">
                {mockPools.filter((p) => p.status === "ongoing").length}
              </p>
              <p className="text-gray-400">⚔️ Ongoing Games</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <p className="text-4xl font-black text-purple-400 mb-2">
                {mockPools.reduce((sum, p) => sum + parseFloat(p.prizePool), 0).toFixed(1)}
              </p>
              <p className="text-gray-400">💎 Total MON Locked</p>
            </div>
          </div>

          {/* Create Pool CTA */}
          {isConnected && (
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    🎨 Create Your Own Pool
                  </h3>
                  <p className="text-gray-300">
                    Stake 2 MON to create a pool and earn 12% royalty when it completes!
                  </p>
                </div>
                <button
                  onClick={() => router.push("/pools/create")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl whitespace-nowrap transition-all hover:scale-105"
                >
                  ➕ Create Pool
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔍 Search Pools
                </label>
                <input
                  type="text"
                  placeholder="Search by pool ID or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🎯 Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PoolStatus | "all")}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Pools</option>
                  <option value="active">🟢 Active (Accepting Players)</option>
                  <option value="ongoing">⚔️ Ongoing (Game Started)</option>
                  <option value="completed">🏆 Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pool Grid */}
          {filteredPools.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Pools Found</h3>
              <p className="text-gray-400">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to create a pool!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPools.map((pool) => (
                <div
                  key={pool.id}
                  onClick={() => router.push(`/pools/${pool.id}`)}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700 hover:border-purple-500 rounded-2xl p-6 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer group"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        pool.status
                      )}`}
                    >
                      {getStatusEmoji(pool.status)} {pool.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">Pool #{pool.id}</span>
                  </div>

                  {/* Prize Pool */}
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-xl p-4 mb-4">
                    <p className="text-yellow-400 text-sm font-medium mb-1">💰 Prize Pool</p>
                    <p className="text-3xl font-black text-white">
                      {pool.prizePool} <span className="text-lg text-gray-400">MON</span>
                    </p>
                  </div>

                  {/* Pool Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Entry Fee</span>
                      <span className="text-white font-bold">{pool.entryFee} MON</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Players</span>
                      <span className="text-white font-bold">
                        {pool.currentPlayers}/{pool.maxPlayers}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all"
                        style={{
                          width: `${(pool.currentPlayers / pool.maxPlayers) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs">Creator</span>
                      <span className="text-purple-400 text-xs font-mono">
                        {pool.creator}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-700 group-hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all">
                    {pool.status === "active" && "🎮 Join Pool"}
                    {pool.status === "ongoing" && "👁️ View Game"}
                    {pool.status === "completed" && "📊 View Results"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
