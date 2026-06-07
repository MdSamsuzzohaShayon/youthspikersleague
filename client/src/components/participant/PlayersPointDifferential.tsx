import React from 'react';
import { INet, IPerformance } from '../../types';

interface IPlayersPointDifferentialProps {
    net: INet;
    gameNum: number;
    gor: number;
}

const PlayersPointDifferential = ({ net, gameNum, gor }: IPlayersPointDifferentialProps) => {

    const gameKey = `game${gameNum}`;
    const returnPointDifferential = (t1p1: IPerformance, t1p2: IPerformance, t2p1: IPerformance, t2p2: IPerformance) => {

        const t1pd = t1p1[gameKey]?.pointDeferential ? t1p1[gameKey].pointDeferential : null;
        const t2pd = t2p1[gameKey]?.pointDeferential ? t2p1[gameKey].pointDeferential : null;

        

        return (
            <div className="players-in-net">
                <div className={`two-p-input two-p-i-1 ${ t1pd > 0 ? "text-success": "text-danger"}`}>
                    <div className={`pd-item got-pd`}>{t1pd}</div>
                    <div className={`pd-item got-pd`}>{t1pd}</div>
                </div>
                <div className="line"></div>

                <div className={`two-p-input two-p-i-2 ${ t2pd > 0 ? "text-success": "text-danger"}`}>
                    <div className={`pd-item got-pd`}>{t2pd}</div>
                    <div className={`pd-item got-pd`}>{t2pd}</div>
                </div>
            </div>
        );
    }

    if (net.performance.length < 4) {
        return (
            <div className="net-less-four">
                {net.performance.map((p, j) => (
                    <div className={`short-net-player ${ p[gameKey]?.pointDeferential && p[gameKey].pointDeferential > 0 ? "text-success": "text-danger"}`} key={j}>{p[gameKey]?.pointDeferential && p[gameKey].pointDeferential}</div>
                ))}
            </div>
        );
    } else {
        if (gor === 1) {
            // 1ST & 4TH VS 2ND  4TH 
            let one = net.performance[0], two = net.performance[1], three = net.performance[2], four = net.performance[3];
            return returnPointDifferential(one, four, two, three);
        } else if (gor === 2) {
            // 1ST & 2ND VS 3RD & 4TH
            let one = net.performance[0], two = net.performance[1], three = net.performance[2], four = net.performance[3];
            return returnPointDifferential(one, two, three, four);
        } else if (gor === 3) {
            // 1ST & 3RD VS 2ND & 4TH
            let one = net.performance[0], two = net.performance[1], three = net.performance[2], four = net.performance[3];
            return returnPointDifferential(one, three, two, four);
        }
    }
}

export default PlayersPointDifferential;
