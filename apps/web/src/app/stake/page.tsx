"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { useMiniApp } from "@/contexts/miniapp-context";
import { formatEther, parseEther } from "viem";

export default function StakePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isMiniAppReady } = useMiniApp();
  const [stakeAmount, setStakeAmount] = useState(2);
  const [isStaking, setIsStaking] = useState(false);
  const [stakeComplete, setStakeComplete] = useState(false);

  // TODO: Replace with actual blockchain data
  const { data: balance } = useBalance({
    address: address,
  });

  const BASE_STAKE = 2; // 2 MON base
  const MAX_STAKE = 200; // 200 MON max
  const hasStaked = false; // TODO: Check actual staking status
  const currentStake = 0; // TODO: Get actual stake amount

  const calculatePoolsEligible = (amount: number) => {
    // Contract logic: Every 2 MON = 1 pool
    // 2 MON = 1 pool, 4 MON = 2 pools, 6 MON = 3 pools, etc.
    return Math.floor(amount / BASE_STAKE);
  };

  const poolsEligible = calculatePoolsEligible(stakeAmount);
  const potentialEarnings = poolsEligible * 6; // Example: 10 players × 5 MON × 12% = 6 MON per pool

  const handleStake = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!balance || parseFloat(formatEther(balance.value)) < stakeAmount) {
      alert(`Insufficient balance! You need at least ${stakeAmount} MON to stake.`);
      return;
    }

    setIsStaking(true);
    try {
      // TODO: Implement actual blockchain transaction
      console.log(`Staking ${stakeAmount} MON for creator status...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStakeComplete(true);
      setTimeout(() => {
        router.push("/create-pool");
      }, 2000);
    } catch (error) {
      console.error("Error staking:", error);
      alert("Failed to stake MON");
    } finally {
      setIsStaking(false);
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
            Please connect your wallet to stake MON
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

  if (stakeComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-12 max-w-2xl text-center">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-5xl font-black text-green-400 mb-4">Stake Successful!</h2>
          <p className="text-2xl text-white mb-2">
            You staked {stakeAmount} MON
          </p>
          <p className="text-xl text-purple-400 mb-6">
            You can now create {poolsEligible} pool{poolsEligible > 1 ? "s" : ""}!
          </p>
          <p className="text-gray-300 text-lg">
            Redirecting to create your first pool...
          </p>
        </div>
      </main>
    );
  }

  if (hasStaked) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
            <div className="bg-green-900/30 border-2 border-green-500/50 rounded-2xl p-12 text-center">
              <div className="text-8xl mb-6">✅</div>
              <h2 className="text-5xl font-black text-green-400 mb-4">
                Already Staked!
              </h2>
              <p className="text-2xl text-white mb-6">
                You have {currentStake} MON staked
              </p>
              <p className="text-gray-300 text-lg mb-8">
                You're all set to create pools and earn royalties!
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push("/create-pool")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all hover:scale-105"
                >
                  🎨 Create Pool
                </button>
                <button
                  onClick={() => router.push("/unstake")}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all hover:scale-105"
                >
                  💸 Unstake
                </button>
              </div>
            </div>
          </div>
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
            onClick={() => router.push("/")}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span> Back
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              🔒 Stake MON
            </h1>
            <p className="text-xl text-gray-300">
              Stake MON to create pools and earn royalties!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stake Calculator */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6">🧮 Stake Calculator</h2>

                <div className="space-y-6">
                  {/* Stake Amount Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white font-semibold">Stake Amount</label>
                      <span className="text-3xl font-black text-purple-400">
                        {stakeAmount} MON
                      </span>
                    </div>

                    <input
                      type="range"
                      min={BASE_STAKE}
                      max={MAX_STAKE}
                      step={2}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Number(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />

                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{BASE_STAKE} MON (Min)</span>
                      <span>{MAX_STAKE} MON (Max)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="block text-white font-semibold mb-3">⚡ Quick Presets</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 10, 20, 50].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setStakeAmount(amount)}
                          className={`py-3 px-2 rounded-lg font-bold transition-all ${
                            stakeAmount === amount
                              ? "bg-purple-600 text-white ring-2 ring-purple-400"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pools Eligible */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-xl p-6">
                    <p className="text-green-400 text-sm font-medium mb-2">
                      🎮 Pools You Can Create
                    </p>
                    <p className="text-6xl font-black text-white mb-3">
                      {poolsEligible}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Every 2 MON staked = 1 pool creation right
                    </p>
                  </div>

                  {/* Your Balance */}
                  <div className="bg-gray-900/50 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Your Balance</p>
                    <p className="text-3xl font-black text-white">
                      {balance ? parseFloat(formatEther(balance.value)).toFixed(2) : "0.00"}{" "}
                      <span className="text-lg text-gray-400">MON</span>
                    </p>
                    {balance && parseFloat(formatEther(balance.value)) >= stakeAmount && (
                      <p className="text-green-400 text-sm mt-2 font-semibold flex items-center gap-2">
                        ✅ Sufficient balance
                      </p>
                    )}
                    {balance && parseFloat(formatEther(balance.value)) < stakeAmount && (
                      <p className="text-red-400 text-sm mt-2 font-semibold flex items-center gap-2">
                        ❌ Need {(stakeAmount - parseFloat(formatEther(balance.value))).toFixed(2)} more MON
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stake Button */}
              <button
                onClick={handleStake}
                disabled={isStaking || (balance && parseFloat(formatEther(balance.value)) < stakeAmount)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-6 text-2xl font-bold rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl"
              >
                {isStaking ? "⏳ Staking..." : `🚀 Stake ${stakeAmount} MON`}
              </button>

              {balance && parseFloat(formatEther(balance.value)) < stakeAmount && (
                <p className="text-center text-red-400 font-semibold">
                  ⚠️ Insufficient balance. You need at least {stakeAmount} MON to stake.
                </p>
              )}
            </div>

            {/* Benefits & Earnings */}
            <div className="space-y-6">
              {/* Potential Earnings */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6">💰 Potential Earnings</h2>

                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-xl p-5">
                    <p className="text-yellow-400 text-sm mb-2">If all {poolsEligible} pools complete</p>
                    <p className="text-4xl font-black text-white mb-2">
                      ~{potentialEarnings} <span className="text-xl text-gray-400">MON</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Based on 10 players × 5 MON entry × 12% royalty per pool
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-300">Your Stake</span>
                      <span className="text-white font-bold">{stakeAmount} MON</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-300">Pools Eligible</span>
                      <span className="text-purple-400 font-bold">{poolsEligible}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-300">Royalty Per Pool</span>
                      <span className="text-green-400 font-bold">12%</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-300">Potential ROI</span>
                      <span className="text-yellow-400 font-bold text-lg">
                        {((potentialEarnings / stakeAmount) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Benefits */}
              <div className="bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6">✨ Creator Benefits</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                    <div className="text-3xl">💰</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Earn 12% Royalty
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Automatically earn 12% of every pool you create when it completes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <div className="text-3xl">🎮</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Scalable Staking
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Stake more to create more pools: 2 MON = 1 pool, up to 200 MON max
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                    <div className="text-3xl">⚡</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Instant Activation
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Start creating pools immediately after staking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                    <div className="text-3xl">🔓</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Unstake Anytime
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Withdraw your stake anytime (30% penalty if pools are incomplete)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📖 How It Works</h3>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Choose stake amount (2-200 MON, multiples of 2)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Every 2 MON gives you 1 pool creation right</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Create pools with custom entry fees and player limits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Earn 12% royalty when each pool completes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">5.</span>
                    <span>Unstake to get your MON back plus all royalties</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
