
import { calculateShanten, getUkeire } from '@pai-forge/riichi-mahjong';

const handA_Keep45m = [
    3, 4, // 4m, 5m
    9, 10, 10, 13, 16, // 1,2,2,5,8p
    21, 24, 24, 26, // 4,7,7,9s
    28, 29, 30 // 2,3,4z
    // Total 13 tiles (cut 6z)
];

// Hand B: Discard 4m (ID 3). Keep 6z (ID 32).
const handB_Cut4m = [
    4, // 5m
    9, 10, 10, 13, 16, // 1,2,2,5,8p
    21, 24, 24, 26, // 4,7,7,9s
    28, 29, 30, 32 // 2,3,4,6z
    // Total 13 tiles
];

console.log('--- Shanten Check ---');
const shantenA = calculateShanten({ closed: handA_Keep45m, exposed: [] });
const shantenB = calculateShanten({ closed: handB_Cut4m, exposed: [] });

console.log(`Hand A (Keep 45m): ${shantenA}`);
console.log(`Hand B (Cut 4m): ${shantenB}`);

if (shantenA < shantenB) {
    console.log("Expected: Hand A is better.");
} else if (shantenA > shantenB) {
    console.log("Unexpected: Hand B is better.");
} else {
    console.log("Unexpected: Shanten is EQUAL.");
    // If equal, check ukeire
    const ukeireA = getUkeire({ closed: handA_Keep45m, exposed: [] });
    const ukeireB = getUkeire({ closed: handB_Cut4m, exposed: [] });
    console.log(`Ukeire A (Keep 45m): Count=${ukeireA.length} [${ukeireA.join(',')}]`);
    console.log(`Ukeire B (Cut 4m): Count=${ukeireB.length} [${ukeireB.join(',')}]`);
}
