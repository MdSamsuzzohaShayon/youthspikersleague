
export const ASSIGN_TYPE = {
    RANK: "RANK_ASSIGN",
    PRERANK: "PRERANK_ASSIGN",
    PACK: "PACK_ASSIGN",
} as const;

export type AssignType = typeof ASSIGN_TYPE[keyof typeof ASSIGN_TYPE];

/** Maps round number (1-indexed) to the API endpoint segment. */
export const ROUND_ASSIGN_URL_SEGMENTS: Record<number, string> = {
    1: "pre-rank-assign-net",
    2: "assign-net",
    3: "twoU-twoD-assign-net",
    4: "oneU-oneD-assign-net",
    5: "oneU-oneD-assign-net",
};

/** Maps round number (1-indexed) to the assign button label. */
export const ASSIGN_BUTTON_LABELS: Record<number, string> = {
    1: "Assign",
    2: "Assign",
    3: "2 Up 2 Down",
    4: "1 Up 1 Down",
    5: "1 Up 1 Down",
};

// Maps round numbers to their corresponding game keys
export const ROUND_GAME_MAP: Record<number, string[]> = {
    1: ["game1", "game2", "game3"],
    2: ["game4", "game5", "game6"],
    3: ["game7", "game8", "game9"],
    4: ["game10", "game11", "game12"],
    5: ["game13", "game14", "game15"],
};
