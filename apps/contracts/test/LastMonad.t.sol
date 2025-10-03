// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {LastMonad} from "../src/LastMonad.sol";

contract LastMonadTest is Test {
    LastMonad public lastMonad;

    address public owner;
    address public creator1;
    address public creator2;
    address public player1;
    address public player2;
    address public player3;
    address public player4;
    address public player5;

    uint256 public constant BASE_STAKE = 2 ether;
    uint256 public constant MAX_STAKE = 200 ether;

    // Allow test contract to receive ether
    receive() external payable {}

    function setUp() public {
        owner = address(this);
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
        player4 = makeAddr("player4");
        player5 = makeAddr("player5");

        // Give everyone some MON
        vm.deal(creator1, 500 ether);
        vm.deal(creator2, 500 ether);
        vm.deal(player1, 50 ether);
        vm.deal(player2, 50 ether);
        vm.deal(player3, 50 ether);
        vm.deal(player4, 50 ether);
        vm.deal(player5, 50 ether);

        lastMonad = new LastMonad();
    }

    // STAKING MECHANISM TESTS

    function test_StakeForPoolCreation_Success() public {
        vm.startPrank(creator1);

        lastMonad.stakeForPoolCreation{value: 10 ether}();

        (uint256 stakedAmount, uint256 poolsCreated, uint256 poolsRemaining, bool hasActiveStake) =
            lastMonad.getCreatorInfo(creator1);

        assertEq(stakedAmount, 10 ether);
        assertEq(poolsCreated, 0);
        assertEq(poolsRemaining, 5); // 10 MON = 5 pools
        assertTrue(hasActiveStake);

        vm.stopPrank();
    }

    function test_StakeForPoolCreation_MinimumStake() public {
        vm.startPrank(creator1);

        lastMonad.stakeForPoolCreation{value: 2 ether}();

        (, , uint256 poolsRemaining, ) = lastMonad.getCreatorInfo(creator1);
        assertEq(poolsRemaining, 1); // 2 MON = 1 pool

        vm.stopPrank();
    }

    function test_StakeForPoolCreation_MaximumStake() public {
        vm.startPrank(creator1);

        lastMonad.stakeForPoolCreation{value: 200 ether}();

        (, , uint256 poolsRemaining, ) = lastMonad.getCreatorInfo(creator1);
        assertEq(poolsRemaining, 100); // 200 MON = 100 pools (max)

        vm.stopPrank();
    }

    function test_StakeForPoolCreation_RevertBelowMinimum() public {
        vm.startPrank(creator1);

        vm.expectRevert("Minimum stake is 2 MON");
        lastMonad.stakeForPoolCreation{value: 1 ether}();

        vm.stopPrank();
    }

    function test_StakeForPoolCreation_RevertAboveMaximum() public {
        vm.startPrank(creator1);

        vm.expectRevert("Maximum stake is 200 MON");
        lastMonad.stakeForPoolCreation{value: 201 ether}();

        vm.stopPrank();
    }

    function test_StakeForPoolCreation_RevertAlreadyStaked() public {
        vm.startPrank(creator1);

        lastMonad.stakeForPoolCreation{value: 10 ether}();

        vm.expectRevert("Already has active stake");
        lastMonad.stakeForPoolCreation{value: 10 ether}();

        vm.stopPrank();
    }

    function test_CalculatePoolsEligible() public {
        assertEq(lastMonad.calculatePoolsEligible(2 ether), 1);
        assertEq(lastMonad.calculatePoolsEligible(4 ether), 2);
        assertEq(lastMonad.calculatePoolsEligible(10 ether), 5);
        assertEq(lastMonad.calculatePoolsEligible(20 ether), 10);
        assertEq(lastMonad.calculatePoolsEligible(200 ether), 100);
    }

    // POOL CREATION TESTS

    function test_CreatePool_Success() public {
        // Stake first
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();

        lastMonad.createPool(1 ether, 4);

        (address creator, uint256 entryFee, uint256 maxPlayers, uint256 currentPlayers, uint256 prizePool, LastMonad.PoolStatus status) =
            lastMonad.getPoolInfo(1);

        assertEq(creator, creator1);
        assertEq(entryFee, 1 ether);
        assertEq(maxPlayers, 4);
        assertEq(currentPlayers, 0);
        assertEq(prizePool, 0);
        assertTrue(status == LastMonad.PoolStatus.OPENED);

        // Check creator's remaining pools
        (, , uint256 poolsRemaining, ) = lastMonad.getCreatorInfo(creator1);
        assertEq(poolsRemaining, 4); // Started with 5, created 1

        vm.stopPrank();
    }

    function test_CreatePool_RevertNoStake() public {
        vm.startPrank(creator1);

        vm.expectRevert("Must stake MON to create pools");
        lastMonad.createPool(1 ether, 4);

        vm.stopPrank();
    }

    function test_CreatePool_RevertNoRemainingPools() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 2 ether}(); // Only 1 pool

        lastMonad.createPool(1 ether, 4); // Create first pool

        vm.expectRevert("No remaining pools available");
        lastMonad.createPool(1 ether, 4); // Try to create second pool

        vm.stopPrank();
    }

    function test_CreatePool_RevertInvalidParameters() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();

        vm.expectRevert("Entry fee must be greater than 0");
        lastMonad.createPool(0, 4);

        vm.expectRevert("Pool must have at least 2 players");
        lastMonad.createPool(1 ether, 1);

        vm.stopPrank();
    }

    // POOL JOINING TESTS

    function test_JoinPool_Success() public {
        // Create pool
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // Join pool
        vm.startPrank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        (, , , uint256 currentPlayers, uint256 prizePool, ) = lastMonad.getPoolInfo(1);
        assertEq(currentPlayers, 1);
        assertEq(prizePool, 1 ether);

        vm.stopPrank();
    }

    function test_JoinPool_RevertCreatorCannotJoin() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);

        vm.expectRevert("Pool creator cannot join their own pool");
        lastMonad.joinPool{value: 1 ether}(1);

        vm.stopPrank();
    }

    function test_JoinPool_RevertIncorrectEntryFee() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.startPrank(player1);
        vm.expectRevert("Incorrect entry fee");
        lastMonad.joinPool{value: 0.5 ether}(1);
        vm.stopPrank();
    }

    function test_JoinPool_RevertAlreadyJoined() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.startPrank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.expectRevert("Already joined this pool");
        lastMonad.joinPool{value: 1 ether}(1);
        vm.stopPrank();
    }

    function test_JoinPool_AutoActivateWhenFull() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2); // 2-player pool
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1); // This should activate the pool

        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);

        assertEq(lastMonad.getCurrentRound(1), 1);
    }

    function test_JoinPool_ActivateAt50Percent() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4); // 4-player pool, 50% = 2 players
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        // Pool should not be active yet with 1 player (25%)
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.OPENED);

        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        // Pool should still be OPENED after 50% (no auto-activation)
        (, , , , , status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.OPENED);

        // But with 2 players (50%), pool should be manually activatable
        assertTrue(lastMonad.canActivatePool(1));

        // Manual activation by creator
        vm.prank(creator1);
        lastMonad.activatePool(1);

        (, , , , , status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);
    }

    // GAME FLOW TESTS

    function test_GameFlow_MinorityWins_Success() public {
        // Setup 4-player game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // All players join
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1); // Pool auto-activates

        // Round 1: 1 HEADS, 3 TAILS -> HEADS should win (minority)
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves round

        // Check round 1 results
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 1);
        assertEq(remainingPlayers[0], player1); // Only HEADS player should remain
        assertEq(lastMonad.getCurrentRound(1), 1); // Game completed in round 1

        // Check game completion
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.COMPLETED);
    }

    function test_GameFlow_MultipleRounds() public {
        // Setup 6-player game for multiple rounds
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 6);
        vm.stopPrank();

        // All players join (using additional addresses)
        address player6 = makeAddr("player6");
        vm.deal(player6, 10 ether);

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player5);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player6);
        lastMonad.joinPool{value: 1 ether}(1); // Pool auto-activates

        // Round 1: 2 HEADS, 4 TAILS -> HEADS should win (minority)
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player5);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player6);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves

        // Check round 1 results
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 2); // player1 and player2 should remain
        assertEq(lastMonad.getCurrentRound(1), 2);

        // Round 2: 1 HEADS, 1 TAILS -> Tie, random resolution
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves with tie-breaker

        // Check final result
        remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 1); // One winner should remain

        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.COMPLETED);
    }

    function test_MakeSelection_RevertInvalidChoice() public {
        // Setup active pool
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.startPrank(player1);
        vm.expectRevert("Invalid choice");
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.NONE);
        vm.stopPrank();
    }

    function test_MakeSelection_RevertNotInPool() public {
        // Setup active pool
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.startPrank(player3); // Player3 didn't join
        vm.expectRevert("Player not in this pool");
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.stopPrank();
    }

    function test_MakeSelection_RevertChoiceAlreadyMade() public {
        // Setup active pool
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.startPrank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);

        vm.expectRevert("Choice already made this round");
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.stopPrank();
    }

    // PRIZE CLAIMING TESTS

    function test_ClaimPrize_Success() public {
        // Setup and complete a game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        // Complete game - player1 wins
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Check winner can claim prize
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        address winner = remainingPlayers[0];

        uint256 balanceBefore = winner.balance;
        vm.prank(winner);
        lastMonad.claimPrize(1);

        uint256 expectedPrize = (2 ether * 88) / 100; // 88% of 2 ether prize pool (12% creator fee)
        assertEq(winner.balance, balanceBefore + expectedPrize);
    }

    function test_ClaimPrize_RevertNotWinner() public {
        // Setup and complete a game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Determine who lost and let them try to claim prize
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        address winner = remainingPlayers[0];
        address loser = (winner == player1) ? player2 : player1;

        // Loser tries to claim prize
        vm.startPrank(loser);
        vm.expectRevert("Only winner can claim prize");
        lastMonad.claimPrize(1);
        vm.stopPrank();
    }

    function test_ClaimPrize_RevertGameNotComplete() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.startPrank(player1);
        vm.expectRevert("Pool is not completed");
        lastMonad.claimPrize(1);
        vm.stopPrank();
    }

    // UNSTAKING TESTS

    function test_UnstakeAndClaim_EarlyUnstake_Penalty() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4); // Create one pool but don't complete it

        // Add a player to test abandonment and refund
        vm.stopPrank();
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        uint256 projectPoolBefore = lastMonad.getProjectPoolBalance();
        uint256 creatorBalanceBefore = creator1.balance;
        uint256 player1BalanceBefore = player1.balance;

        // Early unstake should incur 30% penalty and abandon pool
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        uint256 expectedPenalty = (10 ether * 30) / 100; // 3 ether penalty
        uint256 expectedReturn = 10 ether - expectedPenalty; // 7 ether return

        assertEq(lastMonad.getProjectPoolBalance(), projectPoolBefore + expectedPenalty);
        assertEq(creator1.balance, creatorBalanceBefore + expectedReturn);

        // Player should be refunded
        assertEq(player1.balance, player1BalanceBefore + 1 ether);

        // Pool should be abandoned
        assertTrue(lastMonad.isPoolAbandoned(1));

        // Creator should no longer have active stake
        (, , , bool hasActiveStake) = lastMonad.getCreatorInfo(creator1);
        assertFalse(hasActiveStake);
    }

    function test_UnstakeAndClaim_AllPoolsCompleted_NoPenalty() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}(); // 5 pools
        lastMonad.createPool(1 ether, 2);
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        // Complete first pool
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Complete second pool
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(2);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(2);
        vm.prank(player3);
        lastMonad.makeSelection(2, LastMonad.PlayerChoice.HEADS);
        vm.prank(player4);
        lastMonad.makeSelection(2, LastMonad.PlayerChoice.TAILS);

        uint256 creatorBalanceBefore = creator1.balance;

        // Now unstake should work without penalty + creator rewards
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        uint256 expectedCreatorReward = ((2 ether + 2 ether) * 12) / 100; // 12% of 4 ether = 0.48 ether
        uint256 expectedTotal = 10 ether + expectedCreatorReward;

        assertEq(creator1.balance, creatorBalanceBefore + expectedTotal);

        vm.stopPrank();
    }

    function test_UnstakeAndClaim_RevertNoActiveStake() public {
        vm.startPrank(creator1);
        vm.expectRevert("No active stake");
        lastMonad.unstakeAndClaim();
        vm.stopPrank();
    }

    // VIEW FUNCTION TESTS

    function test_ViewFunctions() public {
        // Setup game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}(); // 5 pools
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1); // Pool activates

        // Test view functions before choices
        assertEq(lastMonad.getCurrentRound(1), 1);
        assertEq(lastMonad.getRemainingPlayers(1).length, 4);
        assertFalse(lastMonad.hasPlayerChosen(1, player1));
        assertFalse(lastMonad.isPlayerEliminated(1, player1));

        // Make some choices
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);

        assertTrue(lastMonad.hasPlayerChosen(1, player1));
        assertEq(uint(lastMonad.getPlayerChoice(1, player1)), uint(LastMonad.PlayerChoice.HEADS));

        // Complete round
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Test after round completion
        assertTrue(lastMonad.isPlayerEliminated(1, player2));
        assertTrue(lastMonad.isPlayerEliminated(1, player3));
        assertTrue(lastMonad.isPlayerEliminated(1, player4));
        assertFalse(lastMonad.isPlayerEliminated(1, player1));

        (uint256 currentRound, uint256 remainingCount, uint256 totalCount, bool isComplete) =
            lastMonad.getGameProgress(1);
        assertEq(currentRound, 1); // Game completed in round 1
        assertEq(remainingCount, 1);
        assertEq(totalCount, 4);
        assertTrue(isComplete);
    }

    // EDGE CASE TESTS

    function test_EdgeCase_TieBreaker() public {
        // Setup 2-player game to force tie
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        // Force tie: 1 HEADS, 1 TAILS
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves with tie-breaker

        // One player should remain (random winner)
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 1);

        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.COMPLETED);
    }

    function test_EdgeCase_PoolActivation_ManualActivation() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4); // 4-player pool, need 2 for 50%
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1); // 50% capacity reached

        assertTrue(lastMonad.canActivatePool(1));

        // Only creator or owner can manually activate
        vm.expectRevert("Only pool creator or owner can activate");
        vm.prank(player1);
        lastMonad.activatePool(1);

        // Creator can activate
        vm.prank(creator1);
        lastMonad.activatePool(1);

        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);
    }

    function test_EdgeCase_NonExistentPool() public {
        vm.startPrank(player1);

        vm.expectRevert("Pool does not exist");
        lastMonad.joinPool{value: 1 ether}(999);

        vm.stopPrank();
    }

    // POOL ABANDONMENT TESTS

    function test_EarlyUnstake_AbandonOpenedPools() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4); // Pool 1 - OPENED
        lastMonad.createPool(1 ether, 4); // Pool 2 - OPENED
        vm.stopPrank();

        // Some players join pool 1, none join pool 2
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        uint256 player1BalanceBefore = player1.balance;
        uint256 player2BalanceBefore = player2.balance;

        // Creator unstakes early - should abandon OPENED pools and refund players
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Check pools are abandoned
        assertTrue(lastMonad.isPoolAbandoned(1));
        assertTrue(lastMonad.isPoolAbandoned(2));

        // Check players were refunded automatically
        assertEq(player1.balance, player1BalanceBefore + 1 ether);
        assertEq(player2.balance, player2BalanceBefore + 1 ether);

        // Check pool status
        (, , , , , LastMonad.PoolStatus status1) = lastMonad.getPoolInfo(1);
        (, , , , , LastMonad.PoolStatus status2) = lastMonad.getPoolInfo(2);
        assertTrue(status1 == LastMonad.PoolStatus.ABANDONED);
        assertTrue(status2 == LastMonad.PoolStatus.ABANDONED);
    }

    function test_EarlyUnstake_ProtectActiveGameplay() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}(); // 5 pools
        lastMonad.createPool(1 ether, 4); // Pool 1 - will be OPENED
        lastMonad.createPool(1 ether, 4); // Pool 2 - will be ACTIVE
        vm.stopPrank();

        // Pool 1: Only partial players joined (OPENED)
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        // Pool 2: Full players joined (ACTIVE)
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(2);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(2);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(2);
        vm.prank(player5);
        lastMonad.joinPool{value: 1 ether}(2); // Pool 2 becomes ACTIVE

        uint256 player1BalanceBefore = player1.balance;

        // Creator unstakes early
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Pool 1 should be abandoned (was OPENED)
        assertTrue(lastMonad.isPoolAbandoned(1));
        assertEq(player1.balance, player1BalanceBefore + 1 ether); // Refunded

        // Pool 2 should NOT be abandoned (was ACTIVE) - check it's still ACTIVE
        (, , , , , LastMonad.PoolStatus status2) = lastMonad.getPoolInfo(2);
        assertTrue(status2 == LastMonad.PoolStatus.ACTIVE);

        // Pool 2 creator should be transferred to contract
        (address pool2Creator, , , , , ) = lastMonad.getPoolInfo(2);
        assertEq(pool2Creator, address(lastMonad)); // Contract is now the creator

        // Game should still be playable in pool 2
        vm.prank(player2);
        lastMonad.makeSelection(2, LastMonad.PlayerChoice.HEADS);
        // This should not revert - game continues normally
    }

    function test_EarlyUnstake_CreatorLosesRewardsFromTransferredPools() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        // Complete the pool before unstaking
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1); // Pool becomes ACTIVE

        // Creator unstakes (transfers pool ownership to contract)
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Complete the game
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Pool is completed, but creator should get NO reward (lost ownership)
        uint256 creatorReward = lastMonad.calculateCreatorReward(creator1);
        assertEq(creatorReward, 0); // No rewards for abandoned pools

        // Winner should still get their prize (88% of 2 ether)
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        address winner = remainingPlayers[0];

        uint256 winnerBalanceBefore = winner.balance;
        vm.prank(winner);
        lastMonad.claimPrize(1);

        uint256 expectedPrize = (2 ether * 88) / 100;
        assertEq(winner.balance, winnerBalanceBefore + expectedPrize);
    }

    function test_ManualRefundFromAbandonedPool() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // Players join but pool doesn't reach 50% (only 1/4 players)
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        uint256 player1BalanceBefore = player1.balance;

        // Creator unstakes - abandons pool and auto-refunds
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Player1 should already be refunded automatically
        assertEq(player1.balance, player1BalanceBefore + 1 ether);

        // Pool should be abandoned
        assertTrue(lastMonad.isPoolAbandoned(1));

        // Trying to claim refund again should fail (already refunded)
        vm.expectRevert("Pool has no funds to refund");
        vm.prank(player1);
        lastMonad.claimRefundFromAbandonedPool(1);
    }

    function test_ManualRefundFromAbandonedPool_NotParticipant() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.prank(creator1);
        lastMonad.unstakeAndClaim(); // Abandon pool

        // Player2 never joined, can't claim refund
        vm.expectRevert("Not a participant in this pool");
        vm.prank(player2);
        lastMonad.claimRefundFromAbandonedPool(1);
    }

    function test_BlockGameActionsOnAbandonedPools() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        // Creator unstakes - abandons OPENED pool
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Should not be able to join abandoned pool
        vm.expectRevert("Pool is not open for joining");
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);

        // Should not be able to make selections on abandoned pool
        vm.expectRevert("Pool is not active");
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
    }

    function test_ActivePoolContinuesAfterCreatorAbandonment() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // Fill pool completely to make it ACTIVE
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1); // Pool becomes ACTIVE

        // Start gameplay - set up for single winner scenario
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        // Don't complete round yet

        // Creator abandons mid-game
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        // Pool should still be ACTIVE, not abandoned
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);

        // Game should continue - player4 can still make selection
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves round

        // After round 1: 1 HEADS (minority), 3 TAILS -> HEADS should win (player1)
        // Game should complete since only 1 player remains
        (, , , , , status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.COMPLETED);

        // Winner can claim prize
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 1);

        address winner = remainingPlayers[0];
        uint256 winnerBalanceBefore = winner.balance;

        vm.prank(winner);
        lastMonad.claimPrize(1);

        // Winner gets 88% of prize pool
        uint256 expectedPrize = (4 ether * 88) / 100;
        assertEq(winner.balance, winnerBalanceBefore + expectedPrize);
    }

    function test_AbandonedPoolCreatorFeesGoToProjectPool() public {
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 2);
        vm.stopPrank();

        // Players join to make pool ACTIVE
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1); // Pool becomes ACTIVE

        // Creator abandons pool (transfers to contract)
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        uint256 projectPoolBefore = lastMonad.getProjectPoolBalance();

        // Verify pool is now owned by contract
        (address poolCreator, , , , , ) = lastMonad.getPoolInfo(1);
        assertEq(poolCreator, address(lastMonad));

        // Complete the game
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Get winner and claim prize
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        address winner = remainingPlayers[0];

        vm.prank(winner);
        lastMonad.claimPrize(1);

        // Verify creator fee (12% of 2 ether = 0.24 ether) went to project pool
        uint256 expectedCreatorFee = (2 ether * 12) / 100;
        assertEq(lastMonad.getProjectPoolBalance(), projectPoolBefore + expectedCreatorFee);
    }

    // PROJECT POOL MANAGEMENT TESTS

    function test_ProjectPoolBalance_InitiallyZero() public {
        assertEq(lastMonad.getProjectPoolBalance(), 0);
    }

    function test_WithdrawProjectPoolFunds_Success() public {
        // First accumulate some funds in project pool via penalty
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        // Early unstake to create penalty
        vm.prank(creator1);
        lastMonad.unstakeAndClaim();

        uint256 projectPoolBalance = lastMonad.getProjectPoolBalance();
        assertTrue(projectPoolBalance > 0); // Should have penalty funds

        uint256 ownerBalanceBefore = owner.balance;
        uint256 withdrawAmount = projectPoolBalance / 2; // Withdraw half

        // Owner withdraws funds
        lastMonad.withdrawProjectPoolFunds(withdrawAmount);

        assertEq(lastMonad.getProjectPoolBalance(), projectPoolBalance - withdrawAmount);
        assertEq(owner.balance, ownerBalanceBefore + withdrawAmount);
    }

    function test_WithdrawProjectPoolFunds_RevertNotOwner() public {
        // Accumulate some funds first
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);

        vm.prank(creator1);
        lastMonad.unstakeAndClaim(); // Create penalty

        // Non-owner tries to withdraw
        vm.expectRevert();
        vm.prank(player1);
        lastMonad.withdrawProjectPoolFunds(1 ether);
    }

    function test_WithdrawProjectPoolFunds_RevertInsufficientFunds() public {
        // Try to withdraw more than available
        vm.expectRevert("Insufficient project pool funds");
        lastMonad.withdrawProjectPoolFunds(1 ether);
    }

    function test_WithdrawProjectPoolFunds_RevertZeroAmount() public {
        vm.expectRevert("Amount must be greater than 0");
        lastMonad.withdrawProjectPoolFunds(0);
    }

    // UNANIMOUS SELECTION TESTS

    function test_UnanimousSelection_AllHeads_RoundRepeats() public {
        // Setup 3-player game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 3);
        vm.stopPrank();

        // All players join
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1); // Pool auto-activates

        // All players choose HEADS
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS); // Auto-resolves round

        // Check that no players were eliminated
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 3); // All 3 players should remain

        // Check that no players are marked as eliminated
        assertFalse(lastMonad.isPlayerEliminated(1, player1));
        assertFalse(lastMonad.isPlayerEliminated(1, player2));
        assertFalse(lastMonad.isPlayerEliminated(1, player3));

        // Check that round number hasn't advanced
        assertEq(lastMonad.getCurrentRound(1), 1);

        // Check that game is still active (not completed)
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);

        // Check that player choices have been reset
        assertFalse(lastMonad.hasPlayerChosen(1, player1));
        assertFalse(lastMonad.hasPlayerChosen(1, player2));
        assertFalse(lastMonad.hasPlayerChosen(1, player3));
    }

    function test_UnanimousSelection_AllTails_RoundRepeats() public {
        // Setup 4-player game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // All players join
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1); // Pool auto-activates

        // All players choose TAILS
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS); // Auto-resolves round

        // Check that all players remain
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 4);

        // Check that game is still active
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.ACTIVE);

        // Verify choices are reset for next round
        assertFalse(lastMonad.hasPlayerChosen(1, player1));
        assertFalse(lastMonad.hasPlayerChosen(1, player2));
        assertFalse(lastMonad.hasPlayerChosen(1, player3));
        assertFalse(lastMonad.hasPlayerChosen(1, player4));
    }

    function test_UnanimousSelection_ThenNormalElimination() public {
        // Setup 4-player game
        vm.startPrank(creator1);
        lastMonad.stakeForPoolCreation{value: 10 ether}();
        lastMonad.createPool(1 ether, 4);
        vm.stopPrank();

        // All players join
        vm.prank(player1);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player2);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player3);
        lastMonad.joinPool{value: 1 ether}(1);
        vm.prank(player4);
        lastMonad.joinPool{value: 1 ether}(1);

        // Round 1: All choose HEADS (unanimous - should repeat)
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);

        // Verify all players remain
        assertEq(lastMonad.getRemainingPlayers(1).length, 4);
        assertEq(lastMonad.getCurrentRound(1), 1); // Round should not advance

        // Round 1 retry: Mixed choices (1 HEADS, 3 TAILS -> HEADS should win)
        vm.prank(player1);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.HEADS);
        vm.prank(player2);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player3);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);
        vm.prank(player4);
        lastMonad.makeSelection(1, LastMonad.PlayerChoice.TAILS);

        // Now elimination should occur
        address[] memory remainingPlayers = lastMonad.getRemainingPlayers(1);
        assertEq(remainingPlayers.length, 1); // Only player1 (HEADS minority) should remain
        assertEq(remainingPlayers[0], player1);

        // Game should be completed
        (, , , , , LastMonad.PoolStatus status) = lastMonad.getPoolInfo(1);
        assertTrue(status == LastMonad.PoolStatus.COMPLETED);
    }
}
