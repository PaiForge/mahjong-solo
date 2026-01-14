
import { calculateShanten, getUkeire } from '@pai-forge/riichi-mahjong'
import type { HaiKindId } from '@pai-forge/riichi-mahjong'
import { test } from 'vitest'

type GameHai = {
  haiId: number
  kindId: HaiKindId
}

function solve(tehaiKindIds: number[], label: string) {
  console.log(`\n=== ${label} ===`);
  const tehai: GameHai[] = tehaiKindIds.map((kindId, index) => ({
    haiId: index,
    kindId: kindId as HaiKindId
  }));

  // Logic from Board.tsx
  const evaluations = tehai.map((hai) => {
    const tehaiAfterDiscard = tehai.filter((h) => h.haiId !== hai.haiId)
    const closed = tehaiAfterDiscard.map((h) => h.kindId);

    // Calculate Shanten
    const shanten = calculateShanten({
      closed,
      exposed: [],
    })

    // Calculate Ukeire
    const ukeireList = getUkeire({
      closed,
      exposed: [],
    })

    return { haiId: hai.haiId, kindId: hai.kindId, shanten, ukeireCount: ukeireList.length, ukeireList }
  })

  // Find Best Moves
  const minShanten = Math.min(...evaluations.map((e) => e.shanten))
  const maxUkeireCount = Math.max(
    ...evaluations.filter((e) => e.shanten === minShanten).map((e) => e.ukeireCount)
  )

  const bestMoves = evaluations.filter((e) => e.shanten === minShanten && e.ukeireCount === maxUkeireCount);

  console.log(`Min Shanten: ${minShanten}`);
  console.log(`Max Ukeire Count (of types): ${maxUkeireCount}`);

  console.log("Recommended Discards:");
  bestMoves.forEach(move => {
    console.log(`- Kind: ${move.kindId} (ID: ${move.haiId}), Shanten: ${move.shanten}, Ukeire Types: ${move.ukeireCount}`);
    console.log(`  Ukeire: ${move.ukeireList.join(', ')}`);
  });

  // Check if specific controversial moves are recommended
  // 4m is 3. 5m is 4.
  const recommends4m = bestMoves.some(m => m.kindId === 3);
  const recommends5m = bestMoves.some(m => m.kindId === 4);

  if (recommends4m) console.log("-> Recommends discarding 4m");
  if (recommends5m) console.log("-> Recommends discarding 5m");
}

test('Reproduce Hint Issue', () => {
  // Case 1: User's reported hand
  // 4m, 1p, 2p, 2p, 5p, 8p, 4s, 7s, 7s, 9s, 2z, 3z, 4z, 6z
  const hand1 = [
    3, // 4m
    9, 10, 10, 13, 16, // 1,2,2,5,8p
    21, 24, 24, 26, // 4,7,7,9s
    28, 29, 30, 32 // 2,3,4,6z
  ];
  solve(hand1, "Case 1: As Written (4m + honors)");

  // Case 2: Explicit 45m Ryanmen
  // 4m, 5m, 1p, 2p, 2p, 5p, 8p, 4s, 7s, 7s, 9s, 2z, 3z
  const hand2 = [
    3, 4, // 4m, 5m
    9, 10, 10, 13, 16, // 1,2,2,5,8p
    21, 24, 24, 26, // 4,7,7,9s
    28, 29, 30 // 2,3,4z
  ];
  solve(hand2, "Case 2: With 45m Ryanmen");
})
