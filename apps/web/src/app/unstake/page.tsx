"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";

export default function UnstakePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [unstakeComplete, setUnstakeComplete] = useState(false);

  // TODO: Replace with actual blockchain data
  const stakedAmount = "2";
  const totalEarnings = "15.6";
  const activePools = 2;
  const completedPools = 3;
  const pendingRewards = "2.4";

  // Calculate penalty
  const hasPenalty = activePools > 0;
  const penaltyPercentage = 10; // 10% penalty for unstaking with active pools
  const penaltyAmount = hasPenalty
    ? (parseFloat(stakedAmount) * penaltyPercentage) / 100
    : 0;
  const unstakeAmount = parseFloat(stakedAmount) - penaltyAmount;

  const handleUnstake = async () => {
    setIsUnstaking(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log("Unstaking MON...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUnstakeComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error unstaking:", error);
      alert("Failed to unstake MON");
    } finally {
      setIsUnstaking(false);
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
            Please connect your wallet to unstake MON
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

  if (unstakeComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-12 max-w-2xl text-center">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-5xl font-black text-green-400 mb-4">Unstake Successful!</h2>
          <p className="text-2xl text-white mb-2">
            You received {unstakeAmount.toFixed(2)} MON
          </p>
          {hasPenalty && (
            <p className="text-gray-300 text-lg">
              (Penalty: {penaltyAmount.toFixed(2)} MON for active pools)
            </p>
          )}
          <p className="text-gray-400 mt-6">Redirecting to dashboard...</p>
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
            onClick={() => router.push("/dashboard")}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span> Back to Dashboard
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              💸 Unstake MON
            </h1>
            <p className="text-xl text-gray-300">
              Withdraw your staked MON and creator status
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Unstake Summary */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6">💰 Unstake Summary</h2>

                <div className="space-y-4">
                  {/* Staked Amount */}
                  <div className="bg-gray-900/50 rounded-xl p-5">
                    <p className="text-gray-400 text-sm mb-2">Currently Staked</p>
                    <p className="text-4xl font-black text-white">
                      {stakedAmount} <span className="text-xl text-gray-400">MON</span>
                    </p>
                  </div>

                  {/* Penalty Warning */}
                  {hasPenalty && (
                    <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="text-red-400 font-bold text-lg mb-1">
                            Active Pool Penalty
                          </p>
                          <p className="text-gray-300 text-sm">
                            You have {activePools} active pool{activePools > 1 ? "s" : ""}. Unstaking now
                            will incur a {penaltyPercentage}% penalty.
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Penalty Amount</span>
                          <span className="text-red-400 font-bold text-lg">
                            -{penaltyAmount.toFixed(2)} MON
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasPenalty && (
                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="text-green-400 font-bold">No Penalty</p>
                          <p className="text-gray-300 text-sm">
                            You have no active pools. Full amount will be returned.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* You Will Receive */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-xl p-5">
                    <p className="text-purple-400 text-sm mb-2">You Will Receive</p>
                    <p className="text-5xl font-black text-white">
                      {unstakeAmount.toFixed(2)}{" "}
                      <span className="text-2xl text-gray-400">MON</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Unstake Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-6 text-2xl font-bold rounded-xl transition-all hover:scale-105 shadow-2xl"
              >
                💸 Unstake MON
              </button>

              {hasPenalty && (
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm font-semibold mb-2">
                    💡 Tip: Avoid Penalty
                  </p>
                  <p className="text-gray-300 text-sm">
                    Wait for your active pools to complete to unstake without penalty and keep
                    your full {stakedAmount} MON stake.
                  </p>
                </div>
              )}
            </div>

            {/* Stats & Info */}
            <div className="space-y-6">
              {/* Your Stats */}
              <div className="bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6">📊 Your Stats</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-400">{totalEarnings} MON</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Rewards</p>
                      <p className="text-2xl font-bold text-yellow-400">{pendingRewards} MON</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-gray-400 text-sm">Active Pools</p>
                      <p className="text-2xl font-bold text-blue-400">{activePools}</p>
                    </div>
                    <div className="text-3xl">🎮</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-gray-400 text-sm">Completed Pools</p>
                      <p className="text-2xl font-bold text-purple-400">{completedPools}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
              </div>

              {/* What Happens */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📖 What Happens Next</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>Your creator status will be revoked immediately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>You won't be able to create new pools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>Active pools will continue but you can't create more</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>You'll still receive royalties from active pools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>
                      Your stake ({hasPenalty ? `${unstakeAmount.toFixed(2)} MON after penalty` : `${stakedAmount} MON`}) will be returned
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>You can re-stake anytime to become a creator again</span>
                  </li>
                </ul>
              </div>

              {/* Alternative Actions */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🤔 Not Sure?</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/create-pool")}
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    🎨 Create Another Pool
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    📊 Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-3xl font-black text-white mb-4">⚠️ Confirm Unstake</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to unstake your MON? This will revoke your creator status.
            </p>

            <div className="bg-gray-900/50 rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Staked Amount</span>
                <span className="text-white font-bold">{stakedAmount} MON</span>
              </div>
              {hasPenalty && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Penalty ({penaltyPercentage}%)</span>
                  <span className="text-red-400 font-bold">-{penaltyAmount.toFixed(2)} MON</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-700">
                <span className="text-gray-400">You Receive</span>
                <span className="text-green-400 font-bold text-xl">
                  {unstakeAmount.toFixed(2)} MON
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
              >
                {isUnstaking ? "⏳ Unstaking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
