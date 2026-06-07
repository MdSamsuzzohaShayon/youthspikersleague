import React from 'react';
import { round1Total, round2Total, round3Total, round4Total, round5Total, totalPoint, roundwiseTotalPoint } from '../../utils/addTotalPoint';
import { round1TD, round2TD, round3TD, round4TD, round5TD, totalDeferential, roundwiseTotalPD } from '../../utils/pointDeferential';


const Point = (props) => {

    const addWithRound = (roundNum, p, roundwise) => {
        if (roundwise === true) {
            switch (roundNum) {
                case 1:
                    return (<React.Fragment>
                        {Math.sign(round1Total(p)) === -1 ? <td className="text-danger">{round1Total(p).toFixed(2)}</td> : <td className="text-success"> {round1Total(p).toFixed(2)}</td>}
                        {Math.sign(round1TD(p)) === -1 ? <td className="text-danger"> {round1TD(p).toFixed(2)}</td> : <td className="text-success"> {round1TD(p).toFixed(2)}</td>}
                        {/* <td> {round1Total(p)}</td> */}
                        {/* <td>{round1TD(p)}</td> */}
                    </React.Fragment>);
                case 2:
                    return (<React.Fragment>
                        {Math.sign(round2Total(p)) === -1 ? <td className="text-danger">{round2Total(p).toFixed(2)}</td> : <td className="text-success"> {round2Total(p).toFixed(2)}</td>}
                        {Math.sign(round2TD(p)) === -1 ? <td className="text-danger"> {round2TD(p).toFixed(2)}</td> : <td className="text-success"> {round2TD(p).toFixed(2)}</td>}
                    </React.Fragment>);
                case 3:
                    return (<React.Fragment>
                        {Math.sign(round3Total(p)) === -1 ? <td className="text-danger"> {round3Total(p).toFixed(2)}</td> : <td className="text-success"> {round3Total(p).toFixed(2)}</td>}
                        {Math.sign(round3TD(p)) === -1 ? <td className="text-danger"> {round3TD(p).toFixed(2)}</td> : <td className="text-success"> {round3TD(p).toFixed(2)}</td>}
                    </React.Fragment>);
                case 4:
                    return (<React.Fragment>
                        {Math.sign(round4Total(p)) === -1 ? <td className="text-danger"> {round4Total(p).toFixed(2)}</td> : <td className="text-success"> {round4Total(p).toFixed(2)}</td>}
                        {Math.sign(round4TD(p)) === -1 ? <td className="text-danger"> {round4TD(p).toFixed(2)}</td> : <td className="text-success"> {round4TD(p).toFixed(2)}</td>}
                    </React.Fragment>);
                case 5:
                    return (<React.Fragment>
                        {Math.sign(round5Total(p)) === -1 ? <td className="text-danger"> {round5Total(p).toFixed(2)}</td> : <td className="text-success"> {round5Total(p).toFixed(2)}</td>}
                        {Math.sign(round5TD(p)) === -1 ? <td className="text-danger"> {round5TD(p).toFixed(2)}</td> : <td className="text-success"> {round5TD(p).toFixed(2)}</td>}
                    </React.Fragment>);

                default:
                    break;
            }
        } else {
            return (<React.Fragment>
                {Math.sign(totalPoint(p)) === -1 ? <td className="text-danger"> {totalPoint(p).toFixed(2)}</td> : <td className="text-success"> {totalPoint(p).toFixed(2)}</td>}
                {Math.sign(totalDeferential(p)) === -1 ? <td className="text-danger"> {totalDeferential(p).toFixed(2)}</td> : <td className="text-success"> {totalDeferential(p).toFixed(2)}</td>}
            </React.Fragment>);
        }

    }

    return (
        <React.Fragment>
            <table className="table table-bordered table-striped table-hover">
                <thead className="thead-dark bg-dark text-light">
                    <tr>
                        <th scope="col">Ranking</th>
                        <th scope="col">Name</th>
                        <th scope="col">Total Point</th>
                        <th scope="col">Total Deferential</th>
                    </tr>
                </thead>
                <tbody>
                    {props.pp.map((p, i) => (
                        <tr key={i}>
                            <td className='rank-num d-flex w-full justify-content-between'>{1+1}</td>
                            <td>{p.participant.firstname + " " + p.participant.lastname} </td>
                            {addWithRound(props.roundNum, p, props.roundwise)}
                        </tr>
                    ))}

                </tbody>
            </table>
        </React.Fragment>
    );
}

export default Point;
