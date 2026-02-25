import React from "react";
import { IPerformance } from "../../types";
import { getTDRound, getTotalPointOfARound } from "../../utils/tptd";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowLiftedPerformancesProps {
  leftedPerformances: IPerformance[];
  roundNum: number;
  /** When provided, shows the "Add" button to recover a performance back into the round. */
  onRecover: ((e: React.MouseEvent, performanceId: string) => void) | null;
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface LeftedPerformanceRowProps {
  performance: IPerformance;
  roundNum: number;
  onRecover: ((e: React.MouseEvent, performanceId: string) => void) | null;
}

const LeftedPerformanceRow: React.FC<LeftedPerformanceRowProps> = ({
  performance,
  roundNum,
  onRecover,
}) => {
  const fullName = `${performance.participant.firstname} ${performance.participant.lastname}`;
  const point = getTotalPointOfARound(performance, roundNum)?.toFixed(3) ?? "—";
  const pointDifferential = getTDRound(performance, roundNum) ?? "—";

  return (
    <tr>
      <td>{fullName}</td>
      <td>{point}</td>
      <td>{pointDifferential}</td>
      {onRecover && (
        <td>
          <button
            className="btn btn-primary"
            onClick={(e) => onRecover(e, performance._id)}
          >
            Add
          </button>
        </td>
      )}
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ShowLiftedPerformances: React.FC<ShowLiftedPerformancesProps> = ({
  leftedPerformances,
  roundNum,
  onRecover,
}) => {
  if (!leftedPerformances || leftedPerformances.length === 0) return null;

  return (
    <>
      <h2 className="h2">Players Who Leave</h2>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Point</th>
            <th scope="col">Point Differential</th>
            {onRecover && <th scope="col">Action</th>}
          </tr>
        </thead>
        <tbody>
          {leftedPerformances.map((performance) => (
            <LeftedPerformanceRow
              key={performance._id}
              performance={performance}
              roundNum={roundNum}
              onRecover={onRecover}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ShowLiftedPerformances;