const express = require('express');
const { formidable } = require('formidable');
const csv = require('csvtojson');
// const fsPromise = require('fs').promises;
const fs = require('fs');
const path = require('path');
// Require library
const xl = require('excel4node');
const { SUPER, GENERAL } = require('../utils/Role');




const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Performance = require('../models/Performance');
const Net = require('../models/Net');


const { check, validationResult } = require('express-validator');

const { wholeRanking } = require('../utils/ranking');
const { updatedPerformance, updateOnlyPoint, getScoreFromDoc } = require('../utils/updatedPerformance');
const { replaceKeys } = require('../utils/helpers');
const { ensureAuth, ensureGuast } = require('../config/auth');
const excelCell = require('../utils/excelCell');


const router = express.Router();


router.get('/:eventID', async (req, res, next) => {
    const allPerformance = await Performance.find({ event: req.params.eventID }).populate({ path: "participant", select: "firstname lastname" });
    res.status(200).json({ performances: allPerformance });
});







/* ⛏️⛏️ CREATE PARTICIPANT OR PERFORMANCE ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.post('/:eventID',
    ensureAuth,
    check('firstname', "Firstname must not empty").notEmpty(),
    check('lastname', "Lastname must not empty").notEmpty(),
    async (req, res, next) => {
        const valErrs = validationResult(req);

        // console.log(req.body);
        if (!valErrs.isEmpty()) {
            console.log(valErrs);
            return res.status(400).json({ errors: valErrs.errors });
        } else {
            try {

                const { firstname, lastname, email, cell, birthdate, city, payment_amount, payment_method } = req.body;
                const new_participant = new Participant({
                    firstname,
                    lastname,
                    email,
                    cell,
                    birthdate,
                    city,
                    payment_amount,
                    payment_method,
                    event: req.params.eventID
                });

                const participant = await new_participant.save();
                const new_performance = new Performance({
                    participant: participant._id,
                    event: req.params.eventID
                });

                const [createEvent, performance] = await Promise.all([
                    Event.findByIdAndUpdate({ _id: req.params.eventID }, { $push: { participants: participant._id } }, { returnDocument: 'after' }),
                    new_performance.save(),
                ]);

                res.status(200).json({ msg: 'Create partipipant and referancing to event', participant, performance });
            } catch (error) {
                res.json(error);
            }
        }
    });















/* ⛏️⛏️ CREATE MULTIPLE PARTICIPANT ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.post('/multiple/:eventID', ensureAuth, async (req, res, next) => {
    const form = formidable({ multiples: false });

    try {
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        // Check if file exists before parsing it
        if (!fs.existsSync(files.file[0].filepath)) {
            throw new Error("CSV file does not exist at the specified path.");
        }


        const jsonObj = await csv().fromFile(files.file[0].filepath);

        const errors = [];
        const allParticipant = [];
        let msg = null;
        for (let obj of jsonObj) {
            const newParticipant = replaceKeys(obj, req.params.eventID);
            if (newParticipant.firstname && newParticipant.lastname && newParticipant.city) {
                allParticipant.push(newParticipant);
            } else {
                msg = "Some participant doesn't have firstname, lastname, or city; those are not included";
            }
        }
        if (msg) errors.push({ msg });

        let participants = [];
        if (errors.length === 0) {
            participants = await Participant.insertMany(allParticipant);
            const performanceList = participants.map(participant => ({ participant: participant._id, event: req.params.eventID }));
            await Performance.insertMany(performanceList);
            for (let participant of participants) {
                await Event.findByIdAndUpdate(
                    { _id: req.params.eventID },
                    { $push: { participants: participant._id } },
                    { returnDocument: 'after' }
                );
            }
        }

        res.json({ errors, eventID: req.params.eventID, files: participants });
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// ⛏️⛏️ UPDATE ALL PERFORMANCE OF A ROUND ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 
router.put('/update-performance/:eventID/:roundNum', ensureAuth, async (req, res, next) => {


    const { updateScore } = req.body;
    const { eventID } = req.params;
    const roundNum = parseInt(req.params.roundNum)
    // console.log("updateScore");
    // console.log(winningExtraPoint);


    updateScore.forEach(async (us, i) => {
        // console.log(us);

        try {
            // CHECK FOR ONLY UPDATE WINNING POINT - TEAM ONE, TWO IS NULL HERE 
            if (us.wp !== null && us.team1 === null && us.team2 === null && us.game === null) {



                const select = "participant net game1 game2 game3 game4 game5 game6 game7 game8 game9 game10 game11 game12 game13 game14 game15 pre_rank";

                const findNet = await Net.findOneAndUpdate({ _id: us.netID }, { wp: us.wp }, { returnDocument: 'after' }).populate({
                    path: "performance",
                    select,
                    populate: {
                        path: "participant",
                        select: "firstname lastname"
                    }
                });

                await updateOnlyPoint(findNet, roundNum, us.wp);



            } else if (us.wp !== null && us.team1 !== null && us.team2 !== null && us.game !== null) {

                // WITH NET 
                let team1Score = us.team1.score, team2Score = us.team2.score;

                if (team1Score === null) {
                    const doc = await Performance.findById(us.team1.players[0]);
                    team1Score = getScoreFromDoc(us.game, doc);
                }
                if (team2Score === null) {
                    // FIND PREVIOUS ITEM AND UPDATE 
                    const doc = await Performance.findById(us.team2.players[0]);
                    team2Score = getScoreFromDoc(us.game, doc);
                }
                // console.log(team1Score);
                // console.log(team2Score);

                let t1pd = team1Score - team2Score;
                let t2pd = team2Score - team1Score;

                let t1p = 0, t2p = 0;
                if (t1pd > t2pd) {
                    t1p = us.wp;
                } else if (t1pd < t2pd) {
                    t2p = us.wp;
                }

                const netUpdate = await Net.findOneAndUpdate({ _id: us.netID }, { wp: us.wp });                                                                                                        //score, tp, tpd, gameSpec
                const updateTeam1 = await Performance.updateMany({ _id: { $in: us.team1.players } }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                const updateTeam2 = await Performance.updateMany({ _id: { $in: us.team2.players } }, { $set: updatedPerformance(us, roundNum, team2Score, t2p, t2pd, us.netID) });
            } else if (us.wp === null && us.team1 !== null && us.team2 !== null && us.game !== null) {
                // WITH NET 
                let team1Score = us.team1.score, team2Score = us.team2.score;

                if (team1Score === null) {
                    const doc = await Performance.findById(us.team1.players[0]);
                    team1Score = getScoreFromDoc(us.game, doc);
                }
                if (team2Score === null) {
                    // FIND PREVIOUS ITEM AND UPDATE 
                    const doc = await Performance.findById(us.team2.players[0]);
                    team2Score = getScoreFromDoc(us.game, doc);
                }
                const findNetPoint = await Net.findById(us.netID);

                let t1pd = team1Score - team2Score;
                let t2pd = team2Score - team1Score;
                // console.log(`t1 - ${us.team1.players} \n t2 - ${us.team2.players}`);
                // console.log(`${i}: t1 score - ${team1Score} , t2 score - ${team2Score}`);

                let t1p = 0, t2p = 0;
                if (t1pd > t2pd) {
                    t1p = findNetPoint.wp;
                } else if (t1pd < t2pd) {
                    t2p = findNetPoint.wp;
                }

                //score, tp, tpd, gameSpec
                const updateTeam1 = await Performance.updateMany({ _id: { $in: us.team1.players } }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                const updateTeam2 = await Performance.updateMany({ _id: { $in: us.team2.players } }, { $set: updatedPerformance(us, roundNum, team2Score, t2p, t2pd, us.netID) });

            } else if (us.wp === null && us.team1 !== null && us.team2 === null && us.game !== null) {
                // console.log("No temp2 - ",us);
                // WITHOUR NET 
                const findNet = await Net.findById(us.netID);
                let team1Score = 0, t1p = findNet.wp, t1pd = 0;
                // console.log(findNet);
                team1Score = us.team1.score, t1pd = us.team1.score;
                if (team1Score <= 0) t1p = 0;
                const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                // if (us.team1.score > 0) {
                //     const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                //     // console.log("Positive single player - ", singlePlayer);
                // }else {
                //     const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, 0, t1pd, us.netID) });
                //     // console.log("--------------");
                //     // console.log("Negative single player - ", singlePlayer);
                //     // console.log("Negative single player - ", updatedPerformance(us, roundNum, team1Score, 0, t1pd, us.netID));
                // }
            } else if (us.wp !== null && us.team1 !== null && us.team2 === null && us.game !== null) {
                // console.log("Hit- ", us);
                const findNet = await Net.findOneAndUpdate({ _id: us.netID }, { wp: us.wp });
                let team1Score = us.team1.score, t1p = us.wp, t1pd = us.team1.score;
                team1Score > 0 ? t1p = us.wp : t1p = 0;
                const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                // if (Math.sign(us.team1.score) === 1) {
                //     const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                // } else {
                //     const singlePlayer = await Performance.updateOne({ _id: us.team1.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, us.netID) });
                // }
            }
        } catch (error) {
            console.log(error);
        }

    });

    // UPDATE EXISTING PERFORMANCE
    res.status(200).json({ msg: req.body });
});


// ⛏️⛏️ UPDATE A SINGLE PERFORMANCE OF A ROUND ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 
router.put('/update-single/:roundNum', ensureAuth, async (req, res, next) => {
    try {
        const { winningPoint, myTeam, opTeam, gameNum, netID, score } = req.body;
        const roundNum = parseInt(req.params.roundNum, 10);


        // ===== Find and populate net =====
        const select = "participant net game1 game2 game3 game4 game5 game6 game7 game8 game9 game10 game11 game12 game13 game14 game15 pre_rank";
        const netExist = await Net.findOne({ _id: netID })
            .populate({
                path: "performance",
                select,
                populate: {
                    path: "participant",
                    select: "firstname lastname"
                }
            });
        if (!netExist) return res.status(404).json({ msg: "Net does not exist" });
        const updatePromises = [];
        const currWP = winningPoint || netExist.wp;

        //  ===== Update performance and winning points in net =====
        if (currWP) {
            updatePromises.push(Net.updateOne({ _id: netID }, { wp: currWP }));
        }



        // ===== Update Performances =====
        if (gameNum && myTeam) {
            const gameKey = `game${gameNum}`;
            const netPerformances = [...netExist.performance];
            const myTeamP1 = netPerformances.find(performance => performance._id.toString() === myTeam[0].toString());
            const myGameObj = { score, point: currWP, pointDeferential: myTeamP1.pointDeferential || score };

            if (opTeam && opTeam.length > 0) {
                const opTeamP1 = netExist.performance.find(performance => performance._id.toString() === opTeam[0].toString());
                const opGameObj = { score: (opTeamP1[gameKey]?.score || 0), point: 0, pointDeferential: opTeamP1.pointDeferential };
                if (!opGameObj.score || myGameObj.score > opGameObj.score) {
                    myGameObj.point = currWP;
                    opGameObj.point = 0;
                    myGameObj.pointDeferential = myGameObj.score - (opGameObj.score || 0);
                    opGameObj.pointDeferential = -(myGameObj.score - (opGameObj.score || 0));
                } else {
                    if (myGameObj.score > opGameObj.score) {
                        myGameObj.point = currWP;
                        opGameObj.point = 0;
                        myGameObj.pointDeferential = (opGameObj.score || 0) - myGameObj.score;
                        opGameObj.pointDeferential = -((opGameObj.score || 0) - myGameObj.score);
                    } else if (myGameObj.score < opGameObj.score) {
                        myGameObj.point = 0;
                        opGameObj.point = currWP;
                        myGameObj.pointDeferential = -((opGameObj.score || 0) - myGameObj.score);
                        opGameObj.pointDeferential = (opGameObj.score || 0) - myGameObj.score;
                    }
                }
                updatePromises.push(Performance.updateMany({ _id: { $in: opTeam } }, { $set: { [gameKey]: opGameObj } }))
            };
            updatePromises.push(Performance.updateMany({ _id: { $in: myTeam } }, { $set: { [gameKey]: myGameObj } }));
        }

        await Promise.all(updatePromises);
        res.status(200).json({ msg: "Updated score successfully" });
    } catch (error) {
        next(error);
    }
});

async function updateWinningPointOnly(winningPoint, netID, roundNum) {
    const select = "participant net game1 game2 game3 game4 game5 game6 game7 game8 game9 game10 game11 game12 game13 game14 game15 pre_rank";
    const findNet = await Net.findOneAndUpdate({ _id: netID }, { wp: winningPoint })
        .populate({
            path: "performance",
            select,
            populate: {
                path: "participant",
                select: "firstname lastname"
            }
        });

    await updateOnlyPoint(findNet, roundNum, winningPoint);
}

async function updateSinglePlayerPerformance(playerData, netID, roundNum) {
    let team1Score = playerData.score || 0;
    let t1p = team1Score > 0 ? playerData.score : 0;
    let t1pd = team1Score;

    const singlePlayer = await Performance.updateOne({ _id: playerData.players[0] }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, netID) });
}

async function updateTeamPerformance(team1, team2, game, netID, roundNum) {
    let team1Score = team1.score || getScoreFromDoc(game, await Performance.findById(team1.players[0]));
    let team2Score = team2.score || getScoreFromDoc(game, await Performance.findById(team2.players[0]));

    let t1pd = team1Score - team2Score;
    let t2pd = team2Score - team1Score;

    let t1p = 0, t2p = 0;
    if (t1pd > t2pd) {
        t1p = winningPoint;
    } else if (t1pd < t2pd) {
        t2p = winningPoint;
    }

    const netUpdate = await Net.findOneAndUpdate({ _id: netID }, { wp: winningPoint });
    const updateTeam1 = await Performance.updateMany({ _id: { $in: team1.players } }, { $set: updatedPerformance(us, roundNum, team1Score, t1p, t1pd, netID) });
    const updateTeam2 = await Performance.updateMany({ _id: { $in: team2.players } }, { $set: updatedPerformance(us, roundNum, team2Score, t2p, t2pd, netID) });

}


router.post('/exports/:eventID', ensureAuth, async (req, res, next) => {
    try {

        const { filename } = req.body;
        const allPerformances = await Performance.find({ event: req.params.eventID }).populate({ path: "participant", select: "firstname lastname" });








        // Create a new instance of a Workbook class
        const workbook = new xl.Workbook();

        // Add Worksheets to the workbook
        const worksheet = workbook.addWorksheet('Sheet 1');

        excelCell(allPerformances, worksheet);



        const style = workbook.createStyle({
            font: {
                color: '#FF0800',
                size: 12,
            },
            numberFormat: '$#,##0.00; ($#,##0.00); -',
        });



        // const statistics = await workbook.write(`./temp/${filename}.xlsx`);
        // const file_dir =  `./temp/${filename}.xlsx`;
        const file_dir = path.resolve('temp', `${filename}.xlsx`);
        workbook.write(file_dir, (err, stats) => {
            if (err) throw err;
            // console.log(stats);
            res.download(file_dir, downloadErr => {
                if (downloadErr) throw downloadErr;
                fs.unlink(file_dir, (deleteErr) => {
                    if (deleteErr) throw deleteErr;
                });
            });
        });





        // res.json({ filename });
        // res.download();
    } catch (error) {
        console.log(error);
    }
});




/* ⛏️⛏️ DELETE PARTICIPANT ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.delete('/:id', ensureAuth, async (req, res, next) => {
    try {
        if (req.userRole === SUPER) {
            const participant = await Participant.findByIdAndDelete(req.params.id);
            const performance = await Performance.findOneAndDelete({ participant: req.params.id });
            const event = await Event.findOneAndUpdate({ participants: participant._id }, { $pull: { participants: participant._id } }, { returnDocument: 'after' });
            res.status(200).json({ msg: 'Delete a participant', participant, performance, event });
        } else {
            res.status(200).json({ msg: 'Only super user are able to delete any perticipant' });
        }
    } catch (error) {
        res.json(error)
    }
});


// ⛏️⛏️ GET ALL PERFORMANCES OF ALL NETS OF A SINGLE EVENT ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 
router.get('/get-performance/:eventID/:roundNum', async (req, res, next) => {
    try {
        const performances = await Performance.find({ event: req.params.eventID }).populate({ path: "participant", select: "firstname lastname" }).exec();
        const rankingPerformance = performances.sort(wholeRanking);
        res.status(200).json({ msg: 'Get all performance of an event', rankingPerformance });
    } catch (error) {
        console.log(error);
    }
});




module.exports = router;
