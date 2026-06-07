// PerformanceTableRow.tsx
import React, { useState, useCallback } from "react";
import { IPerformance } from "../../types";
import { getTDRound, getTotalPointOfARound } from "../../utils/totalPointAndDiffrential";

interface PerformanceTableRowProps {
  performance: IPerformance;
  index: number;
  roundNum: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, index: number, id: string) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onLeft: (e: React.MouseEvent, id: string) => void;
  onRankChange: (performanceId: string, newRank: number) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const displayName = `${performance.participant.firstname} ${performance.participant.lastname}`;
  const totalPoints = getTotalPointOfARound(performance, roundNum)?.toFixed(2) ?? '0.00';
  const totalDifferential = getTDRound(performance, roundNum)?.toFixed(2) ?? '0.00';
  
  // Display rank: use actual rank from performance or fallback to index + 1
  const displayRank = performance.rank ?? index + 1;

  const handleRankDoubleClick = useCallback(() => {
    if (roundNum <= 1) {
      setIsEditing(true);
      setEditValue(displayRank.toString());
    }
  }, [roundNum, displayRank]);

  const handleRankInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleRankInputBlur = useCallback(() => {
    const newRank = parseInt(editValue, 10);
    if (!isNaN(newRank) && newRank > 0) {
      onRankChange(performance._id, newRank);
    }
    setIsEditing(false);
  }, [editValue, performance._id, onRankChange]);

  const handleRankInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRankInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [handleRankInputBlur]);

  return (
    <tr
      draggable
      onDragStart={(e) => onDragStart(e, index, performance._id)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      style={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f0f0f0' : 'transparent',
        transition: 'opacity 0.2s, background-color 0.2s',
      }}
    >
      <td style={{ width: '280px' }}>
        <span>{displayName}</span>
      </td>
      <td>
        {roundNum <= 1 ? (
          isEditing ? (
            <input
              type="number"
              className="form-control"
              value={editValue}
              onChange={handleRankInputChange}
              onBlur={handleRankInputBlur}
              onKeyDown={handleRankInputKeyDown}
              style={{ width: '80px' }}
              min="1"
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={handleRankDoubleClick}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Double-click to edit rank"
            >
              {displayRank}
            </span>
          )
        ) : (
          <span>{displayRank}</span>
        )}
      </td>
      <td>{totalPoints}</td>
      <td>{totalDifferential}</td>
      <td>
        <button 
          className="btn btn-danger btn-sm" 
          onClick={(e) => onLeft(e, performance._id)}
          title="Remove from this round"
        >
          Left
        </button>
      </td>
    </tr>
  );
};

export default React.memo(PerformanceTableRow);