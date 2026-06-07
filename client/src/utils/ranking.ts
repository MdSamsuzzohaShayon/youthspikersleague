
function addR1(ab) {
    let pointA = 0;
    if (ab.game1 && ab.game1 !== null) pointA += ab.game1.point; 
    if (ab.game2 && ab.game2 !== null) pointA += ab.game2.point; 
    if (ab.game3 && ab.game3 !== null) pointA += ab.game3.point;
    return pointA;
}





function addR2(ab) {
    let pointA = 0;
    if (ab.game4 && ab.game4 !== null) pointA += ab.game4.point; 
    if (ab.game5 && ab.game5 !== null) pointA += ab.game5.point; 
    if (ab.game6 && ab.game6 !== null) pointA += ab.game6.point;
    return pointA;
}





function addR3(ab) {
    let pointA = 0;
    if (ab.game7 && ab.game7 !== null) pointA += ab.game7.point; 
    if (ab.game8 && ab.game8 !== null) pointA += ab.game8.point; 
    if (ab.game9 && ab.game9 !== null) pointA += ab.game9.point;
    return pointA;
}



function addR4(ab) {
    let pointA = 0;
    if (ab.game10 && ab.game10 !== null) pointA += ab.game10.point; 
    if (ab.game11 && ab.game11 !== null) pointA += ab.game11.point; 
    if (ab.game12 && ab.game12 !== null) pointA += ab.game12.point;
    return pointA;
}


function addR5(ab) {
    let pointA = 0;
    if (ab.game13 && ab.game13 !== null) pointA += ab.game13.point; 
    if (ab.game14 && ab.game14 !== null) pointA += ab.game14.point; 
    if (ab.game15 && ab.game15 !== null) pointA += ab.game15.point;
    return pointA;
}





function pdtR1(ab) {
    let pdt = 0;
    if (ab.game1 && ab.game1 !== null) pdt += ab.game1.pointDeferential;
    if (ab.game2 && ab.game2 !== null) pdt += ab.game2.pointDeferential;
    if (ab.game3 && ab.game3 !== null) pdt += ab.game3.pointDeferential;
    return pdt;
}


function pdtR2(ab) {
    let pdt = 0;
    if (ab.game4 && ab.game4 !== null) pdt += ab.game4.pointDeferential;
    if (ab.game5 && ab.game5 !== null) pdt += ab.game5.pointDeferential
    if (ab.game6 && ab.game6 !== null) pdt += ab.game6.pointDeferential;
    return pdt;
}


function pdtR3(ab) {
    let pdt = 0;
    if (ab.game7 && ab.game7 !== null) pdt += ab.game7.pointDeferential;
    if (ab.game8 && ab.game8 !== null) pdt += ab.game8.pointDeferential;
    if (ab.game9 && ab.game9 !== null) pdt += ab.game9.pointDeferential;
    return pdt;
}



function pdtR4(ab) {
    let pdt = 0;
    if (ab.game10 && ab.game10 !== null) pdt += ab.game10.pointDeferential;
    if (ab.game11 && ab.game11 !== null) pdt += ab.game11.pointDeferential;
    if (ab.game12 && ab.game12 !== null) pdt += ab.game12.pointDeferential;
    return pdt;
}



function pdtR5(ab) {
    let pdt = 0;
    if (ab.game13 && ab.game13 !== null) pdt += ab.game13.pointDeferential;
    if (ab.game14 && ab.game14 !== null) pdt += ab.game14.pointDeferential;
    if (ab.game15 && ab.game15 !== null) pdt += ab.game15.pointDeferential;
    return pdt;
}










export const rankingRound1 = (a, b) => {

    let pointA = 0, pointB = 0;
    pointA = addR1(a);
    pointB = addR1(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR2(a);
        pdtb = pdtR2(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}







// RANKING ROUND2 INDIVIDUAL 
export const rankingRound2 = (a, b) => {

    let pointA = 0, pointB = 0;
    pointA = addR2(a);
    pointB = addR2(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR2(a);
        pdtb = pdtR2(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}





export const rankingRound3 = (a, b) => {

    let pointA = 0, pointB = 0;
    pointA = addR3(a);
    pointB = addR3(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR3(a);
        pdtb = pdtR3(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}






export const rankingRound4 = (a, b) => {

    let pointA = 0, pointB = 0;
    pointA = addR4(a);
    pointB = addR4(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1;
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR4(a);
        pdtb = pdtR4(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}



export const rankingRound5 = (a, b) => {

    let pointA = 0, pointB = 0;
    pointA = addR5(a);
    pointB = addR5(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR5(a);
        pdtb = pdtR5(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}




export const wholeRanking = (a, b) => {
    let pointA = 0, pointB = 0;
    pointA = addR1(a) + addR2(a) + addR3(a) + addR4(a) + addR5(a);
    pointB = addR1(b) + addR2(b) + addR3(b) + addR4(b) + addR5(b);
    if (pointA > pointB) {
        return -1;
    }
    if (pointB > pointA) {
        return 1
    }
    if (pointA == pointB) {
        let pdta = 0, pdtb = 0;
        pdta = pdtR1(a) + pdtR2(a) + pdtR3(a) + pdtR4(a) + pdtR5(a);
        pdtb = pdtR1(b) + pdtR2(b) + pdtR3(b) + pdtR4(b) + pdtR5(b);
        if (pdta > pdtb) {
            return -1;
        }
        if (pdta < pdtb) {
            return 1;
        }
        return 0;

    }
    return 0;
}






export const netRanking = (rankPerformanceInNet, roundNum) => {
    const netRank = [];
    for (let i = 0; i < rankPerformanceInNet.length; i++) {
        if (roundNum === 1) {
            netRank.push(rankPerformanceInNet[i].performance.sort(rankingRound1));
        } else if (roundNum === 2) {
            netRank.push(rankPerformanceInNet[i].performance.sort(rankingRound2));
        } else if (roundNum === 3) {
            netRank.push(rankPerformanceInNet[i].performance.sort(rankingRound3));
        } else if (roundNum === 4) {
            netRank.push(rankPerformanceInNet[i].performance.sort(rankingRound4));
        } else if (roundNum === 5) {
            netRank.push(rankPerformanceInNet[i].performance.sort(rankingRound5));
        }
    }
    return netRank;
}










