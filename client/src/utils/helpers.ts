// @ts-nocheck

import { INet } from "../types";
import { ROUND_GAME_MAP } from "./constants";




export const tabKeyFocusChange = () => {
    // console.log("Tab key focus change");
    const wp = document.querySelectorAll('.winning-point');
    const scoreInputs = document.querySelectorAll('.input-score');
    const scoreInputsNoNet = document.querySelectorAll('.input-score-no-net');

    const firstGameInput = new Array();
    const secondGameInput = new Array();
    const thirdGameInput = new Array();


    for (let i = 0; i < wp.length; i++) {
        wp[i].setAttribute('tabIndex', `${i + 1}`);
    }


    // ARRANGING ALL GAME ELEMENTS 
    let i = 0, chunk = 6;
    while (i < scoreInputs.length) {
        try {
            firstGameInput.push(scoreInputs[i], scoreInputs[i + 1]);
            secondGameInput.push(scoreInputs[i + 2], scoreInputs[i + 3]);
            thirdGameInput.push(scoreInputs[i + 4], scoreInputs[i + 5]);
        } catch (error) {
            console.log(error);
        }
        i += chunk;
    }

    const numOfGame = 3;
    const noNetDivider = scoreInputsNoNet.length / numOfGame;
    firstGameInput.forEach((fgi, i) => {
        // fgi.setAttribute("id", `score-input-${i + 1}`);
        fgi.setAttribute("tabIndex", `${i + 1 + wp.length}`);
    });

    for (let i = 0; i < noNetDivider; i++) {
        scoreInputsNoNet[i].setAttribute('tabIndex', `${i + 1 + firstGameInput.length + wp.length}`);
    }

    secondGameInput.forEach((sgi, i) => {
        sgi.setAttribute("tabIndex", `${i + 1 + firstGameInput.length + noNetDivider + wp.length}`);
    });

    for (let i = 0; i < noNetDivider; i++) {
        scoreInputsNoNet[i + noNetDivider].setAttribute('tabIndex', `${i + 1 + firstGameInput.length + noNetDivider + secondGameInput.length + wp.length}`);
    }

    thirdGameInput.forEach((tgi, i) => {
        tgi.setAttribute("tabIndex", `${i + 1 + firstGameInput.length + noNetDivider + secondGameInput.length + noNetDivider + wp.length}`);
    });
    for (let i = 0; i < noNetDivider; i++) {
        scoreInputsNoNet[i + noNetDivider + noNetDivider].setAttribute('tabIndex', `${i + 1 + firstGameInput.length + noNetDivider + secondGameInput.length + noNetDivider + thirdGameInput.length + wp.length}`);
    }
}



export const formattedDate = (eventISODate) => {
    // (new Date(event.date).getMonth() + 1) + '-' + new Date(event.date).getDate() + '-' + new Date(event.date).getFullYear();
    const year = new Date(eventISODate).getFullYear();
    const day = new Date(eventISODate).getDate();
    const month = new Date(eventISODate).getMonth() + 1
    return month + "-" + day + "-" + year;
}

interface IRoundResponse{complete: number[], incomplete: number[]}



/**
 * Checks if a round is completed or not based on games played in all nets.
 * @param roundNumber - 1-based round index
 * @param allNets - array of nets with performances
 * @returns object with `complete` and `incomplete` arrays containing net numbers
 */
export const checkRoundCompleted = (
  roundNumber: number,
  allNets: INet[]
): IRoundResponse => {
  const result: IRoundResponse = { complete: [], incomplete: [] };



  const gameKeys = ROUND_GAME_MAP[roundNumber] || [];

  if (!allNets || allNets.length === 0) {
    result.incomplete.push(" ");
    return result;
  }

  allNets.forEach((net, netIndex) => {
    net.performance.forEach((perf) => {
      // Check if all required games for this round are present
      const isComplete = gameKeys.every((key) => perf[key]);
      if (isComplete) {
        result.complete.push(netIndex + 1);
      } else {
        result.incomplete.push(netIndex + 1);
      }
    });
  });

  // Remove duplicates
  result.complete = Array.from(new Set(result.complete));
  result.incomplete = Array.from(new Set(result.incomplete));

  return result;
};
