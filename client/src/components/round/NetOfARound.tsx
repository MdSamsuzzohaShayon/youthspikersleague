import React from 'react';
import { POINT, POINT_DIFFERENTIAL, SCORE, hostname, } from "../../utils/global";
import { getTotalPPD } from "../../utils/getTotalPPD";
import { INet, IPerformance } from '../../types';
import TeamScoreInput from '../score/TeamScoreInput';
import WinningPointInput from '../score/WinningPointInput';
import { handleRequestUnauthenticated } from '../../utils/auth';
import PlayersPointField from '../score/PlayerPointField';
import PerformerSerializer from '../participant/PerformerSerializer';
import PlayersPointDifferential from '../participant/PlayersPointDifferential';
import ArrangePerformer from '../participant/ArrangePerformer';

interface INetOfARound {
    game: number[];
    nets: INet[];
    roundNum: number;
    rankPerformanceInNet: any;
    token: string;
    eventID: string;
    refetchFunc?: ()=> void;
}

function NetOfARound(props: INetOfARound) {



    const handleSingleScoreUpdate = async (innerGN: number | null, netID: string, winningPoint: number | null,  score?: number, myTeam?: string[], opTeam?: string[]) => {
        try {
            const token = localStorage.getItem("token");
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                // { winningPoint, myTeam, opTeam, gameNum, netID, score } 
                body: JSON.stringify({ winningPoint, myTeam, opTeam, gameNum: innerGN, netID, score }),
            };
            const response = await fetch(
                `${hostname}/api/performance/update-single/${props.roundNum}`,
                requestOptions
            );
            handleRequestUnauthenticated(response);
            // if(props.refetchFunc) await props.refetchFunc();
            

        } catch (error) {
            console.error(error);
        }
    }


    return (
        <div className="show-all-nets row">
            {/* PLAYER GAME, SCORE, POINT, POINT DIFFRENTIAL  */}
            <div className="table-responsive-lg net-table">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark text-capitalize">
                        <tr className="header-group-1 ">
                            <th colSpan={2} scope="colgroup"></th>
                            <th colSpan={4} scope="colgroup">
                                Game {props.game[0]}
                            </th>
                            <th colSpan={4} scope="colgroup">
                                Game {props.game[1]}
                            </th>
                            <th colSpan={4} scope="colgroup">
                                Game {props.game[2]}
                            </th>
                            <th colSpan={3} scope="colgroup">
                                Total
                            </th>
                        </tr>
                        <tr className="header-group-2">
                            <th scope="col">Net</th>
                            <th> <button type="button" className="btn btn-secondary p-0 m-0 bg-transparent text-white border-0 btn-outline-transparent" data-bs-toggle="tooltip" data-bs-placement="top" title="Winning point" onClick={(e) => e.preventDefault()}>
                                W/P
                            </button>
                            </th>
                            <th scope="col">Team</th>
                            <th scope="col">Score</th>
                            <th scope="col">Point</th>
                            <th scope="col">point differential</th>
                            <th scope="col">Team</th>
                            <th scope="col">Score</th>
                            <th scope="col">Point</th>
                            <th scope="col">point differential</th>
                            <th scope="col">Team</th>
                            <th scope="col">Score</th>
                            <th scope="col">Point</th>
                            <th scope="col">point differential</th>
                            <th scope="col">Participant</th>
                            <th scope="col">point</th>
                            <th scope="col">point differential</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.nets &&
                            props.nets.map((net, i) => (
                                <tr key={i} className="horizontal-border">
                                    <th scope="row">Net {net.sl || i + 1}</th>
                                    <td> <WinningPointInput defaultValue={net.wp} roundNum={props.roundNum} netID={net._id} handleScoreUpdate={handleSingleScoreUpdate} /></td>

                                    <td><ArrangePerformer key={`ap-1`} gameNum={props.game[0]} gor={1} performer={net.performance} /></td>
                                    <td><TeamScoreInput key={`tsi-1`} net={net} gameNum={props.game[0]} gor={1} scoreType={SCORE} handleScoreUpdate={handleSingleScoreUpdate} /></td>
                                    <td><PlayersPointField key={`ppf-1`} gameNum={props.game[0]} gor={1} net={net} /> </td>
                                    <td><PlayersPointDifferential key={`ppd-1`} gameNum={props.game[0]} gor={1} net={net}/></td>

                                    <td><ArrangePerformer key={`ap-2`} gameNum={props.game[1]} gor={2} performer={net.performance} /></td>
                                    <td><TeamScoreInput key={`tsi-2`} net={net} gameNum={props.game[1]} gor={2} scoreType={SCORE} handleScoreUpdate={handleSingleScoreUpdate} /></td>
                                    <td><PlayersPointField key={`ppf-2`} gameNum={props.game[1]} gor={2} net={net} /> </td>
                                    <td><PlayersPointDifferential key={`ppd-2`} gameNum={props.game[1]} gor={2} net={net}/></td>


                                    <td><ArrangePerformer key={`ap-3`} gameNum={props.game[2]} gor={3} performer={net.performance} /></td>
                                    <td><TeamScoreInput key={`tsi-3`} net={net} gameNum={props.game[2]} gor={3} scoreType={SCORE} handleScoreUpdate={handleSingleScoreUpdate} /></td>
                                    <td><PlayersPointField key={`ppf-3`} gameNum={props.game[2]} gor={3} net={net} /> </td>
                                    <td><PlayersPointDifferential key={`ppd-3`} gameNum={props.game[2]} gor={3} net={net}/></td>


                                    <td> <PerformerSerializer performers={props.rankPerformanceInNet[i]} /></td>
                                    <td>{getTotalPPD(props.rankPerformanceInNet[i], POINT, props.roundNum)}</td>
                                    <td>{getTotalPPD(props.rankPerformanceInNet[i], POINT_DIFFERENTIAL, props.roundNum)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default NetOfARound;