import { IPerformance } from "../types";
import { roundwiseTotalPoint } from "./addTotalPoint";
import { roundwiseTotalPD } from "./pointDeferential";


export const getTotalPointOfARound = (performance: IPerformance, roundNum: number) => {
  /**
   * temperary update.
   */
  roundNum--;
  if (roundNum === 0) {
    return 0;
  } else if (roundNum === 1) {
    return roundwiseTotalPoint(performance, "game1", "game2", "game3");
  } else if (roundNum === 2) {
    return (
      roundwiseTotalPoint(performance, "game1", "game2", "game3") +
      roundwiseTotalPoint(performance, "game4", "game5", "game6")
    );
  } else if (roundNum === 3) {
    return (
      roundwiseTotalPoint(performance, "game1", "game2", "game3") +
      roundwiseTotalPoint(performance, "game4", "game5", "game6") +
      roundwiseTotalPoint(performance, "game7", "game8", "game9")
    );
  } else if (roundNum === 4) {
    return (
      roundwiseTotalPoint(performance, "game1", "game2", "game3") +
      roundwiseTotalPoint(performance, "game4", "game5", "game6") +
      roundwiseTotalPoint(performance, "game7", "game8", "game9") +
      roundwiseTotalPoint(performance, "game10", "game11", "game12")
    );
  } else if (roundNum === 5) {
    return (
      roundwiseTotalPoint(performance, "game1", "game2", "game3") +
      roundwiseTotalPoint(performance, "game4", "game5", "game6") +
      roundwiseTotalPoint(performance, "game7", "game8", "game9") +
      roundwiseTotalPoint(performance, "game10", "game11", "game12") +
      roundwiseTotalPoint(performance, "game13", "game14", "game15")
    );
  }
};

export const getTDRound = (performance: IPerformance, roundNum: number) => {
  /**
   * temperary update.
   */
  roundNum--;
  if (roundNum === 1) {
    return roundwiseTotalPD(performance, "game1", "game2", "game3");
  } else if (roundNum === 2) {
    return (
      roundwiseTotalPD(performance, "game1", "game2", "game3") +
      roundwiseTotalPD(performance, "game4", "game5", "game6")
    );
  } else if (roundNum === 3) {
    return (
      roundwiseTotalPD(performance, "game1", "game2", "game3") +
      roundwiseTotalPD(performance, "game4", "game5", "game6") +
      roundwiseTotalPD(performance, "game7", "game8", "game9")
    );
  } else if (roundNum === 4) {
    return (
      roundwiseTotalPD(performance, "game1", "game2", "game3") +
      roundwiseTotalPD(performance, "game4", "game5", "game6") +
      roundwiseTotalPD(performance, "game7", "game8", "game9") +
      roundwiseTotalPD(performance, "game10", "game11", "game12")
    );
  } else if (roundNum === 5) {
    return (
      roundwiseTotalPD(performance, "game1", "game2", "game3") +
      roundwiseTotalPD(performance, "game4", "game5", "game6") +
      roundwiseTotalPD(performance, "game7", "game8", "game9") +
      roundwiseTotalPD(performance, "game10", "game11", "game12") +
      roundwiseTotalPD(performance, "game13", "game14", "game15")
    );
  }
};

