const Net = require("../models/Net");
const Round = require('../models/Round');
const { chunkArray } = require("../utils/netHelpers");

const NET_SIZE = 4;

/**
 * Creates Net documents for each chunk of performance IDs,
 * then upserts the Round with all net and performance references.
 *
 * @param {string[]} orderedPerformanceIds - Performance IDs in desired net order
 * @param {string[]} leftedPerformanceIds  - Performance IDs left out (byes)
 * @param {string}   eventId              - The event ObjectId
 * @param {number}   roundNumber          - The round number
 */
const assignPerformancesToNets = async (orderedPerformanceIds, leftedPerformanceIds, eventId, roundNumber) => {
    const performanceChunks = chunkArray(orderedPerformanceIds, NET_SIZE);

    // Delete existing nets for this round if it already exists
    const existingRound = await Round.findOne({ no: roundNumber, event: eventId });
    if (existingRound) {
        await Net.deleteMany({ event: eventId, round: existingRound._id });
    }

    // Create one Net per chunk
    const netIds = await Promise.all(
        performanceChunks.map(async (chunk, index) => {
            const net = await Net.create({
                sl: index + 1,
                performance: chunk,
                event: eventId,
            });
            return net._id;
        })
    );

    // Upsert the Round document
    const round = await Round.findOneAndUpdate(
        { no: roundNumber, event: eventId },
        {
            performances: orderedPerformanceIds,
            nets: netIds,
            left: leftedPerformanceIds,
        },
        { upsert: true, new: true }
    );

    // Link all nets back to this round
    await Net.updateMany({ _id: { $in: netIds } }, { round: round._id });

    return { round, netIds };
};

module.exports = { assignPerformancesToNets };