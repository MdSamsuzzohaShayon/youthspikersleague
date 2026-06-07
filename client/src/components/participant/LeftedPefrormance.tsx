import React from "react";
// ALL CONDITIONS RELATED TO PERFORMANCE
import { getTDRound, getTotalPointOfARound } from "../../utils/totalPointAndDiffrential";
import { IPerformance } from "../../types";

interface ILeftedPerformanceProps {
  performances: IPerformance[];
  roundNum: number;
  onRecover: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, performanceId: string) => void;
  concatinate: boolean;
}

const LeftedPefrormance = ({ performances,
  roundNum,
  onRecover,
  concatinate }: ILeftedPerformanceProps
) => {

  return (
    <React.Fragment>
      <h2 className="h2">Players Who Leave</h2>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Point</th>
            <th scope="col">Point Differential</th>
            {concatinate && <th scope="col">Action</th>}
          </tr>
        </thead>
        <tbody>
          {performances.map((performance, i) => (
            <tr key={i}>
              <td>
                {performance.participant.firstname + " " + performance.participant.lastname}
              </td>
              <td>{getTotalPointOfARound(performance, roundNum).toFixed(3)}</td>
              <td>{getTDRound(performance, roundNum)}</td>
              {concatinate && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => onRecover(e, performance._id)}
                  >
                    {" "}
                    Add
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </React.Fragment>
  );
};


export default LeftedPefrormance;