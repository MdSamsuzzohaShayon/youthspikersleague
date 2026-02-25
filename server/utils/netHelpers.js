const _ = require('underscore');

/**
 * Shuffles an array randomly using Fisher-Yates-like approach via Set deduplication.
 * Returns a new array with same elements in random order.
 */
const shuffleArray = (arr) => {
    const shuffled = [];
    const pool = [...arr];
    while (shuffled.length < pool.length) {
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        if (!shuffled.includes(randomItem)) shuffled.push(randomItem);
    }
    return shuffled;
};

/**
 * Swaps two elements in an array in-place.
 */
const swapArrayItem = (arr, indexA, indexB) => {
    [arr[indexA], arr[indexB]] = [arr[indexB], arr[indexA]];
};

/**
 * Splits a flat array of performance IDs into chunks of `chunkSize`,
 * returning an array of arrays.
 */
const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
};

/**
 * Reorders performances by pre-rank snake/zigzag distribution across nets.
 * Ensures players of similar rank are spread across nets rather than grouped.
 */
const reorderByPreRank = (preRankedIds) => {
    const chunkSize = 4;
    const len = preRankedIds.length;
    const remain = len % chunkSize || chunkSize;
    const netCount = Math.ceil(len / chunkSize);
    let reordered = [];

    for (let i = 0; i < netCount; i++) {
        const indexes = [
            ..._.range(i, netCount * remain, netCount),
            ...(i < netCount - 1 ? _.range(i + netCount * remain, len, netCount - 1) : [])
        ];
        reordered = [...reordered, ...indexes.map(idx => preRankedIds[idx])];
    }
    return reordered;
};

/**
 * Applies two-up two-down swap pattern to performance IDs array in-place.
 */
const applyTwoUpTwoDownSwap = (performanceIds) => {
    const chunkSize = 4;
    const netCount = Math.ceil(performanceIds.length / chunkSize);
    for (let i = 1; i < netCount; i++) {
        swapArrayItem(performanceIds, i * chunkSize - 2, i * chunkSize);
        if (i * chunkSize + 1 < performanceIds.length) {
            swapArrayItem(performanceIds, i * chunkSize - 1, i * chunkSize + 1);
        }
    }
};

/**
 * Applies one-up one-down swap pattern to performance IDs array in-place.
 */
const applyOneUpOneDownSwap = (performanceIds) => {
    const chunkSize = 4;
    const netCount = Math.ceil(performanceIds.length / chunkSize);
    for (let i = 1; i < netCount; i++) {
        swapArrayItem(performanceIds, i * chunkSize - 1, i * chunkSize);
    }
};

module.exports = {
    shuffleArray,
    swapArrayItem,
    chunkArray,
    reorderByPreRank,
    applyTwoUpTwoDownSwap,
    applyOneUpOneDownSwap,
};