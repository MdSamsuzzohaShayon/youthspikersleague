const express = require('express');
const _ = require('underscore');

const Net = require('../models/Net');
const Performance = require('../models/Performance');
const Round = require('../models/Round');

const { ensureAuth } = require('../config/auth');
const { assignPerformancesToNets } = require("../services/net");
const {
    shuffleArray,
    reorderByPreRank,
    applyTwoUpTwoDownSwap,
    applyOneUpOneDownSwap,
} = require('../utils/netHelpers');

const router = express.Router();


// ─── INITIAL RANDOM ASSIGNMENT ────────────────────────────────────────────────
// Creates nets for the first round by randomly distributing all performances.

router.post('/assign-initial-net/:eventId', ensureAuth, async (req, res) => {
    try {
        const { eventId } = req.params;

        const existingNets = await Net.find({ event: eventId });
        if (existingNets.length > 0) {
            return res.status(201).json({ msg: 'Nets already assigned', nets: existingNets });
        }

        const allPerformances = await Performance.find({ event: eventId });
        const shuffledPerformances = shuffleArray(allPerformances);
        const shuffledIds = shuffledPerformances.map(p => p._id);

        const { round, netIds } = await assignPerformancesToNets(shuffledIds, [], eventId, 1);

        return res.status(200).json({ msg: 'Assigned to initial nets randomly', round, netCount: netIds.length });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


// ─── PRE-RANK ASSIGNMENT ──────────────────────────────────────────────────────
// Assigns nets for round 1 by pre-ranking performances and distributing
// using a snake/zigzag pattern so similarly ranked players are spread across nets.

router.post('/pre-rank-assign-net/:eventId/:roundNum', ensureAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const roundNumber = parseInt(req.params.roundNum, 10);
        const { performances, leftedPerformance } = req.body;

        if (roundNumber >= 2) {
            return res.status(400).json({ msg: 'Pre-ranking is only available in round 1' });
        }


        // Save pre-rank on each performance and clear game scores
        const gameFieldsToClear = _.range(1, 16).reduce((acc, i) => ({ ...acc, [`game${i}`]: 1 }), {});
        const preRankedIds = [];

        for (let rank = 1; rank <= performances.length; rank++) {
            const perfId = performances[rank - 1];

            await Performance.updateOne(
                { _id: perfId },
                {
                    $set: { pre_rank: rank },
                    $unset: gameFieldsToClear,
                }
            );

            preRankedIds.push(perfId);
        }

        // Reorder by snake pattern across nets, then clear old rounds/nets
        const reorderedIds = reorderByPreRank(preRankedIds);
        await Net.deleteMany({ event: eventId });
        await Round.deleteMany({ event: eventId });

        await assignPerformancesToNets(reorderedIds, leftedPerformance, eventId, roundNumber);

        return res.status(201).json({ msg: 'Pre-ranked and assigned to nets', params: req.params });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


// ─── RANK-BASED ASSIGNMENT ────────────────────────────────────────────────────
// Assigns nets for a given round using performances in the order provided (already ranked).

router.post('/assign-net/:eventId/:roundNum', ensureAuth, async (req, res) => {
    try {
        const { eventId, roundNum } = req.params;
        const { performances, leftedPerformance } = req.body;


        await assignPerformancesToNets(performances, leftedPerformance, eventId, roundNum);

        return res.status(201).json({ msg: 'Assigned to nets by rank', params: req.params });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


// ─── TWO-UP TWO-DOWN ASSIGNMENT ───────────────────────────────────────────────
// Assigns nets with a "2 up, 2 down" promotion/relegation swap pattern
// applied across net boundaries.

router.post('/twoU-twoD-assign-net/:eventId/:roundNum', ensureAuth, async (req, res) => {
    try {
        const { eventId, roundNum } = req.params;
        const { performances, leftedPerformance } = req.body;

        const performanceIds = performances.map(p => p._id);
        const leftedIds = leftedPerformance.map(p => p.id);

        applyTwoUpTwoDownSwap(performanceIds);
        await assignPerformancesToNets(performanceIds, leftedIds, eventId, roundNum);

        return res.status(201).json({ msg: 'Assigned to nets with 2-up 2-down pattern', params: req.params });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


// ─── ONE-UP ONE-DOWN ASSIGNMENT ───────────────────────────────────────────────
// Assigns nets with a "1 up, 1 down" promotion/relegation swap pattern
// applied across net boundaries.

router.post('/oneU-oneD-assign-net/:eventId/:roundNum', ensureAuth, async (req, res) => {
    try {
        const { eventId, roundNum } = req.params;
        const { performances, leftedPerformance } = req.body;

        const performanceIds = performances.map(p => p._id);
        const leftedIds = leftedPerformance.map(p => p.id);

        applyOneUpOneDownSwap(performanceIds);
        await assignPerformancesToNets(performanceIds, leftedIds, eventId, roundNum);

        return res.status(201).json({ msg: 'Assigned to nets with 1-up 1-down pattern', params: req.params });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


// ─── RANDOM REASSIGNMENT ──────────────────────────────────────────────────────
// Randomly reassigns performances to nets for any given round.
// Creates the round if it doesn't exist, or reshuffles if it does.

router.post('/random-assign-net/:eventId/:roundNum', ensureAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const roundNumber = parseInt(req.params.roundNum, 10);
        const { performances, leftedPerformance } = req.body;

        const performanceIds = performances.map(p => p._id);
        const leftedIds = leftedPerformance.map(p => p._id);

        const shuffledIds = shuffleArray(performanceIds);
        await assignPerformancesToNets(shuffledIds, leftedIds, eventId, roundNumber);

        return res.status(201).json({ msg: 'Randomly assigned to nets', params: req.params });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


module.exports = router;