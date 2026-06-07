import { POINT, POINT_DIFFERENTIAL } from "./global";
import { round1Total, round2Total, round3Total, round4Total, round5Total } from './addTotalPoint';
import { round1TD, round2TD, round3TD, round4TD, round5TD } from './pointDeferential';
import { IPerformance } from "../types";

// ⛏️⛏️ GET TOTAL POINT AND DIFERENTIAL FOR THIS ROUND ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
export const getTotal = (net, round, score) => {

    const roundwisePoint = (p) => {
        if (round === 1) {
            return <div className="total">{round1Total(p)}</div>
        } else if (round === 2) {
            return <div className="total">{round1Total(p) + round2Total(p)}</div>
        } else if (round === 3) {
            return <div className="total">{round1Total(p) + round2Total(p) + round3Total(p)}</div>
        } else if (round === 4) {
            return <div className="total">{round1Total(p) + round2Total(p) + round3Total(p) + round4Total(p)}</div>
        } else if (round === 5) {
            return <div className="total">{round1Total(p) + round2Total(p) + round3Total(p) + round4Total(p) + round5Total(p)}</div>
        }
    }
    const roundwisePD = (p) => {
        if (round === 1) {
            return <div className="total">{round1TD(p)}</div>;
        } else if (round === 2) {
            return <div className="total">{round1TD(p) + round2TD(p)}</div>;
        } else if (round === 3) {
            return <div className="total">{round1TD(p) + round2TD(p) + round3TD(p)}</div>;
        } else if (round === 4) {
            return <div className="total">{round1TD(p) + round2TD(p) + round3TD(p) + round4TD(p)}</div>;
        } else if (round === 5) {
            return <div className="total">{round1TD(p) + round2TD(p) + round3TD(p) + round4TD(p) + round5TD(p)}</div>;
        }
    }



    if (net.performance.length < 4) {
        if (score === POINT) {
            return net.performance.map((p, j) => (
                <div style={{ width: "100%", height: "100%" }} className="mt-4" key={j}>
                    {roundwisePoint(p)}
                </div>
            ));
        }
        if (score === POINT_DIFFERENTIAL) {
            return net.performance.map((p, j) => (
                <div style={{ width: "100%", height: "100%" }} className="mt-4" key={j}>
                    {roundwisePD(p)}
                </div>
            ));
        }
    } else {
        if (score === POINT) {
            if (round === 2) {
                return (
                    <div >
                        <div className="total my-4">{round2Total(net.performance[0])}</div>
                        <div className="total my-4">{round2Total(net.performance[3])}</div>
                        <div className="total my-4">{round2Total(net.performance[1])}</div>
                        <div className="total my-4">{round2Total(net.performance[2])}</div>
                    </div>
                );
            } else if (round === 3) {
                return (
                    <div >
                        <div className="total my-4">{round3Total(net.performance[0])}</div>
                        <div className="total my-4">{round3Total(net.performance[3])}</div>
                        <div className="total my-4">{round3Total(net.performance[1])}</div>
                        <div className="total my-4">{round3Total(net.performance[2])}</div>
                    </div>
                );
            } else if (round === 4) {
                return (
                    <div >
                        <div className="total my-4">{round4Total(net.performance[0])}</div>
                        <div className="total my-4">{round4Total(net.performance[3])}</div>
                        <div className="total my-4">{round4Total(net.performance[1])}</div>
                        <div className="total my-4">{round4Total(net.performance[2])}</div>
                    </div>
                );
            } else if (round === 5) {
                return (
                    <div >
                        <div className="total my-4">{round5Total(net.performance[0])}</div>
                        <div className="total my-4">{round5Total(net.performance[3])}</div>
                        <div className="total my-4">{round5Total(net.performance[1])}</div>
                        <div className="total my-4">{round5Total(net.performance[2])}</div>
                    </div>
                );
            }


        }
        if (score === POINT_DIFFERENTIAL) {
            if (round === 2) {
                const t2td0 = parseInt(String(round2TD(net.performance[0])));
                const t2td3 = parseInt(String(round2TD(net.performance[3])));
                const t2td1 = parseInt(String(round2TD(net.performance[1])));
                const t2td2 = parseInt(String(round2TD(net.performance[2])));
                return (<div  >
                    {Math.sign(t2td0) === -1 ? <div className="total my-4 text-danger">{t2td0}</div> : <div className="total my-4 text-success">{t2td0}</div>}
                    {Math.sign(t2td3) === -1 ? <div className="total my-4 text-danger">{t2td3}</div> : <div className="total my-4 text-success">{t2td3}</div>}
                    {Math.sign(t2td1) === -1 ? <div className="total my-4 text-danger">{t2td1}</div> : <div className="total my-4 text-success">{t2td1}</div>}
                    {Math.sign(t2td2) === -1 ? <div className="total my-4 text-danger">{t2td2}</div> : <div className="total my-4 text-success">{t2td2}</div>}
                </div>
                );
            } else if (round === 3) {
                const t3td0 = parseInt(String(round3TD(net.performance[0])));
                const t3td3 = parseInt(String(round3TD(net.performance[3])));
                const t3td1 = parseInt(String(round3TD(net.performance[1])));
                const t3td2 = parseInt(String(round3TD(net.performance[2])));
                return (<div  >
                    {Math.sign(t3td0) === -1 ? <div className="total my-4 text-danger">{t3td0}</div> : <div className="total my-4 text-success">{t3td0}</div>}
                    {Math.sign(t3td3) === -1 ? <div className="total my-4 text-danger">{t3td3}</div> : <div className="total my-4 text-success">{t3td3}</div>}
                    {Math.sign(t3td1) === -1 ? <div className="total my-4 text-danger">{t3td1}</div> : <div className="total my-4 text-success">{t3td1}</div>}
                    {Math.sign(t3td2) === -1 ? <div className="total my-4 text-danger">{t3td2}</div> : <div className="total my-4 text-success">{t3td2}</div>}
                </div>
                );
            } else if (round === 4) {
                const t4td0 = parseInt(String(round4TD(net.performance[0])));
                const t4td3 = parseInt(String(round4TD(net.performance[3])));
                const t4td1 = parseInt(String(round4TD(net.performance[1])));
                const t4td2 = parseInt(String(round4TD(net.performance[2])));
                return (<div  >
                    {Math.sign(t4td0) === -1 ? <div className="total my-4 text-danger">{t4td0}</div> : <div className="total my-4 text-success">{t4td0}</div>}
                    {Math.sign(t4td3) === -1 ? <div className="total my-4 text-danger">{t4td3}</div> : <div className="total my-4 text-success">{t4td3}</div>}
                    {Math.sign(t4td1) === -1 ? <div className="total my-4 text-danger">{t4td1}</div> : <div className="total my-4 text-success">{t4td1}</div>}
                    {Math.sign(t4td2) === -1 ? <div className="total my-4 text-danger">{t4td2}</div> : <div className="total my-4 text-success">{t4td2}</div>}
                </div>
                );
            } else if (round === 5) {
                const t5td0 = parseInt(String(round5TD(net.performance[0])));
                const t5td3 = parseInt(String(round5TD(net.performance[3])));
                const t5td1 = parseInt(String(round5TD(net.performance[1])));
                const t5td2 = parseInt(String(round5TD(net.performance[2])));
                return (<div  >
                    {Math.sign(t5td0) === -1 ? <div className="total my-4 text-danger">{t5td0}</div> : <div className="total my-4 text-success">{t5td0}</div>}
                    {Math.sign(t5td3) === -1 ? <div className="total my-4 text-danger">{t5td3}</div> : <div className="total my-4 text-success">{t5td3}</div>}
                    {Math.sign(t5td1) === -1 ? <div className="total my-4 text-danger">{t5td1}</div> : <div className="total my-4 text-success">{t5td1}</div>}
                    {Math.sign(t5td2) === -1 ? <div className="total my-4 text-danger">{t5td2}</div> : <div className="total my-4 text-success">{t5td2}</div>}
                </div>
                );
            }
        }
    }
}



// ⛏️⛏️ GET TOTAL POINT AND DIFERENTIAL FOR THIS ROUND ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
export const getTotalPPD = (performance: IPerformance, score: string, roundNum: number) => {


    const returnPointSpecificRound = (per, specificRound) => {
        if (per.length < 4) {
            return (<div className="net-less-four-total">{
                per.map((p, j) => {
                    if (Math.sign(specificRound(p)) === 1) {
                        return <div className="tp-point short-net-player text-success" key={j}>{specificRound(p).toFixed(2)}</div>;
                    } else if (Math.sign(specificRound(p)) === (-1)) {
                        return <div className="tp-point short-net-player  text-danger" key={j}>{specificRound(p).toFixed(2)}</div>;
                    } else {
                        return <div className="tp-point short-net-player " key={j}>{specificRound(p).toFixed(2)}</div>;
                    }
                })
            }</div>);
        } else {
            return (<div className="players-in-net-total">{
                per.map((p, j) => {
                    if (Math.sign(specificRound(p)) === 1) {
                        return <div className="tp-point text-success" key={j}>{specificRound(p).toFixed(2)}</div>;
                    } else if (Math.sign(specificRound(p)) === (-1)) {
                        return <div className="tp-point text-danger" key={j}>{specificRound(p).toFixed(2)}</div>;
                    } else {
                        return <div className="tp-point" key={j}>{specificRound(p).toFixed(2)}</div>;
                    }
                })
            }</div>);
        }
    }



    if (score === POINT) {
        if (roundNum === 1) {
            return returnPointSpecificRound(performance, round1Total)
        } else if (roundNum === 2) {
            return returnPointSpecificRound(performance, round2Total);
        } else if (roundNum === 3) {
            return returnPointSpecificRound(performance, round3Total);
        } else if (roundNum === 4) {
            return returnPointSpecificRound(performance, round4Total)
        } else if (roundNum === 5) {
            return returnPointSpecificRound(performance, round5Total);
        } else {
            return;
        }
    }



    const returnSpecificPointDifferential = (per, specificPD) => {
        if (per.length < 4) {
            return (<div className="net-less-four-total">{
                per.map((p, j) => {
                    if (Math.sign(specificPD(p)) === 1) {
                        return <div className="tp-point short-net-player text-success" key={j}>{specificPD(p).toFixed(2)}</div>;
                    } else if (Math.sign(specificPD(p)) === (-1)) {
                        return <div className="tp-point short-net-player  text-danger" key={j}>{specificPD(p).toFixed(2)}</div>;
                    } else {
                        return <div className="tp-point short-net-player " key={j}>{specificPD(p).toFixed(2)}</div>;
                    }
                })
            }</div>);
        } else {
            return (<div className="players-in-net-total">{
                per.map((p, j) => {
                    if (Math.sign(specificPD(p)) === 1) {
                        return <div className="tp-point text-success" key={j}>{specificPD(p).toFixed(2)}</div>;
                    } else if (Math.sign(specificPD(p)) === (-1)) {
                        return <div className="tp-point text-danger" key={j}>{specificPD(p).toFixed(2)}</div>;
                    } else {
                        return <div className="tp-point" key={j}>{specificPD(p).toFixed(2)}</div>;
                    }
                })
            }</div>);
        }
    }

    if (score === POINT_DIFFERENTIAL) {



        if (roundNum === 1) {
            return returnSpecificPointDifferential(performance, round1TD)
        } else if (roundNum === 2) {
            return returnSpecificPointDifferential(performance, round2TD)
        } else if (roundNum === 3) {
            return returnSpecificPointDifferential(performance, round3TD)
        } else if (roundNum === 4) {
            return returnSpecificPointDifferential(performance, round4TD)
        } else if (roundNum === 5) {
            return returnSpecificPointDifferential(performance, round5TD)
        } else {
            return;
        }
    }
}

