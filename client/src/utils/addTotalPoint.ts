import { IPerformance } from "../types";

export const totalPoint = (performance) => {
    let point = 0;
    point = round1Total(performance) + round2Total(performance) + round3Total(performance) + round4Total(performance) + round5Total(performance);

    // if (performance.round13) point += performance.round13.point;
    // if (performance.round14) point += performance.round14.point;
    // if (performance.round15) point += performance.round15.point;

    return point;
}


export const roundwiseTotalPoint = (performance: IPerformance, game1: string, game2: string, game3: string): number => {
    let point = 0;
    if(performance){
        if (performance[game1] && performance[game1] !== "undefined") point += performance[game1].point;
        if (performance[game2] && performance[game2] !== "undefined") point += performance[game2].point;
        if (performance[game3] && performance[game3] !== "undefined") point += performance[game3].point;
    }

    return point;
}




export const round1Total = (performance) => {
    
    let point = 0;
    if (performance.game1) point += performance.game1.point;
    if (performance.game2) point += performance.game2.point;
    if (performance.game3) point += performance.game3.point;

    return point;
}



export const round2Total = (performance) => {
    let point = 0;
    if (performance.game4) point += performance.game4.point;
    if (performance.game5) point += performance.game5.point;
    if (performance.game6) point += performance.game6.point;

    return point;
}



export const round3Total = (performance) => {
    let point = 0;
    if (performance.game7) point += performance.game7.point;
    if (performance.game8) point += performance.game8.point;
    if (performance.game9) point += performance.game9.point;

    return point;
}

export const round4Total = (performance) => {
    let point = 0;
    if (performance.game10) point += performance.game10.point;
    if (performance.game11) point += performance.game11.point;
    if (performance.game12) point += performance.game12.point;

    return point;
}



export const round5Total = (performance) => {
    let point = 0;
    if (performance.game13) point += performance.game13.point;
    if (performance.game14) point += performance.game14.point;
    if (performance.game15) point += performance.game15.point;

    return point;
}


