
// ─── Sub-components ───────────────────────────────────────────────────────────

import { IPerformance } from "../../types";
import { getTDRound, getTotalPointOfARound } from "../../utils/tptd";

interface PerformanceTableRowProps {
    performance: IPerformance;
    index: number;
    roundNum: number;
    isDragging: boolean;
    orderedPerformances: IPerformance[];
    onDragStart: (e: React.DragEvent, index: number, id: string) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    onLeft: (e: React.MouseEvent, id: string) => void;
    onRankChange: (index: number, newRanking: number) => void;
}

const PerformanceTableRow: React.FC<PerformanceTableRowProps> = ({
    performance,
    index,
    roundNum,
    isDragging,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onLeft,
    onRankChange,
}) => {
    const name = `${performance.participant.firstname} ${performance.participant.lastname}`;
    const point = getTotalPointOfARound(performance, roundNum)?.toFixed(2) ?? "";
    const pointDifferential = getTDRound(performance, roundNum)
        ? getTDRound(performance, roundNum).toFixed(2)
        : "";

    return (
        <tr
            key={performance._id}
            draggable
            onDragStart={(e) => onDragStart(e, index, performance._id)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            style={{
                cursor: "grab",
                opacity: isDragging ? 0.5 : 1,
                backgroundColor: isDragging ? "#f0f0f0" : "transparent",
            }}
        >
            <td>
                <i className="fas fa-grip-vertical" style={{ color: "#999", marginRight: "8px" }} />
                {index + 1}
            </td>
            <td>{name}</td>
            <td>
                {roundNum <= 1 ? (
                    <input
                        type="number"
                        className="form-control"
                        defaultValue={index + 1}
                        style={{ width: "80px" }}
                        onChange={(e) => onRankChange(index, parseInt(e.target.value) || 1)}
                    />
                ) : (
                    index + 1
                )}
            </td>
            <td>{point}</td>
            <td>{pointDifferential}</td>
            <td>
                <button className="btn btn-danger" onClick={(e) => onLeft(e, performance._id)}>
                    Left
                </button>
            </td>
        </tr>
    );
};

export default PerformanceTableRow;
