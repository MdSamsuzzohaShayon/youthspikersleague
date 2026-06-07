/**
 * For MongoDB Model
 */

export interface IParticipant {
    _id: string;
    firstname: string;
    lastname: string;
    email?: string;
    cell?: string;
    birthdate?: string;
    payment_amount?: string;
    payment_method?: string;
    city?: string;
}

export interface IPerformance {
    _id: string;
    event: string;
    pre_rank: number;
    rank?: number;
    participant: IParticipant;
}
export interface INet {
    _id: string;
    performance: IPerformance[];
    sl: number;
    wp: number;
}

export interface IEvent {
    _id: string;
    title: string;
    date: string;
    // desc: string;
    participants: IParticipant[];
}


export interface IRound {
    no: number;
    event: IEvent,
    performances: IPerformance[],
    nets: INet[],
    left: IPerformance[];
}


/**
 * Temporary data
 */


export interface ITeam {
    players: string[];
    score: number | null;
}


export interface IUpdateScore {
    game: number | string;
    wp: null | number; // winning point
    netID: string;
    team1: ITeam;
    team2: ITeam;
}

export interface IError {
    msg: string;
}