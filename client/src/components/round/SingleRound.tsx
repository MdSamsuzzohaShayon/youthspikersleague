// SingleRound.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { hostname } from "../../utils/global";
import Loader from "../elements/Loader";
import AddParticipant from "../participant/AddParticipant";
import LeftedPefrormance from "../participant/LeftedPefrormance";
import { tabKeyFocusChange } from "../../utils/helpers";
import NetOfARound from "./NetOfARound";
import { IPerformance, IRound } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  ASSIGN_BUTTON_LABELS,
  ASSIGN_TYPE,
  ROUND_ASSIGN_URL_SEGMENTS,
  type AssignType,
} from "../../utils/constants";
import ViewToggle from "./ViewToggle";
import StatusMessage from "./StatusMessage";
import ScoreConfirmModal from "./ScoreConfirmModal";
import PerformanceTableRow from "./PerformanceTableRow";
import ShowLiftedPerformances from "./LeftedPerformanceRow";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SingleRoundProps {
  round: IRound;
  initialize: boolean;
  roundNum: number;
  rankPerformanceInNet: any;
  eventID: string;
  eventName: string | null;
  performances: IPerformance[];
  leftRound: IPerformance[];
  game: number[];
  incomepleteMessage: string | null;
  updateNets: (value: boolean) => void;
  activeItemHandler: (e: React.MouseEvent, roundNum: number) => void;
  refetchFunc?: () => Promise<void>;
}

interface DragState {
  index: number;
  id: string;
}

interface RankUpdatePayload {
  _id: string;
  rank: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = hostname;
const STATUS_DISPLAY_DURATION = 3000; // ms

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuthToken = (): string | null => localStorage.getItem("token");

const createAuthHeaders = (token: string | null): HeadersInit => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const buildApiRequest = (body: object, token: string | null): RequestInit => ({
  method: "POST",
  headers: createAuthHeaders(token),
  body: JSON.stringify(body),
});

const buildPutRequest = (body: object, token: string | null): RequestInit => ({
  method: "PUT",
  headers: createAuthHeaders(token),
  body: JSON.stringify(body),
});

// ─── Main Component ───────────────────────────────────────────────────────────

function SingleRound({
  roundNum,
  rankPerformanceInNet,
  eventID,
  eventName,
  performances: initialPerformances,
  leftRound: initialLeftedPerformances,
  game,
  incomepleteMessage,
  round,
  updateNets,
  activeItemHandler,
  refetchFunc,
}: SingleRoundProps) {
  const navigate = useNavigate();

  // ── State ──
  const [isLoading, setIsLoading] = useState(false);
  const [performances, setPerformances] = useState<IPerformance[]>([]);
  const [orderedPerformances, setOrderedPerformances] = useState<IPerformance[]>([]);
  const [leftedPerformances, setLeftedPerformances] = useState<IPerformance[]>([]);
  const [showPerformances, setShowPerformances] = useState(true);
  const [assignType, setAssignType] = useState<AssignType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    visible: false,
    isNegative: false,
  });
  const [draggedItem, setDraggedItem] = useState<DragState | null>(null);
  // const [performance, setPerformance]



  // Refs for debouncing rank updates
  const rankUpdateTimeoutRef = useRef(null);
  const pendingRankUpdatesRef = useRef<RankUpdatePayload[]>([]);

  // ── Memoized values ──
  const nets = useMemo(() => round?.nets ?? [], [round]);

  // ── Effects ──
  useEffect(() => {
    const sortedPerformances = sortPerformancesByRank(initialPerformances);
    setPerformances([...initialPerformances]);
    setOrderedPerformances(sortedPerformances);
    setLeftedPerformances(initialLeftedPerformances);

    if (!round) setShowPerformances(false);

    setTimeout(tabKeyFocusChange, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!statusMessage.visible) return;

    const timer = setTimeout(() => {
      setStatusMessage({ visible: false, isNegative: false });
    }, STATUS_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [statusMessage.visible]);

  // Cleanup rank update timeout on unmount
  useEffect(() => {
    return () => {
      if (rankUpdateTimeoutRef.current) {
        clearTimeout(rankUpdateTimeoutRef.current);
        // Flush pending updates on unmount
        if (pendingRankUpdatesRef.current.length > 0) {
          updateRanksOnServer(pendingRankUpdatesRef.current);
        }
      }
    };
  }, []);

  // ── Helper Functions ──
  const sortPerformancesByRank = useCallback((perfs: IPerformance[]): IPerformance[] => {
    return [...perfs].sort((a, b) => {
      if (!a.rank && !b.rank) return 0;
      if (!a.rank) return 1; // null ranks go to end
      if (!b.rank) return -1;
      return a.rank - b.rank;
    });
  }, []);

  const reorderWithRanks = useCallback((perfs: IPerformance[]): IPerformance[] => {
    return perfs.map((perf, idx) => ({
      ...perf,
      rank: idx + 1,
    }));
  }, []);

  // ── API calls ──
  const updateRanksOnServer = useCallback(async (rankUpdates: RankUpdatePayload[]): Promise<void> => {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE}/api/performance/rank/update/${eventID}/${roundNum}`,
        buildPutRequest({ performances: rankUpdates }, token)
      );

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to update ranks: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[updateRanksOnServer]", error);
      setStatusMessage({ visible: true, isNegative: true });
    }
  }, [eventID, roundNum, navigate]);

  const debouncedRankUpdate = useCallback((rankUpdates: RankUpdatePayload[]) => {
    pendingRankUpdatesRef.current = rankUpdates;

    if (rankUpdateTimeoutRef.current) {
      clearTimeout(rankUpdateTimeoutRef.current);
    }

    rankUpdateTimeoutRef.current = setTimeout(() => {
      updateRanksOnServer(rankUpdates);
      rankUpdateTimeoutRef.current = null;
    }, 500); // Debounce 500ms
  }, [updateRanksOnServer]);

  const postToApi = useCallback(
    async (urlSegment: string, body: object): Promise<Response> => {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/api/net/${urlSegment}/${eventID}/${roundNum}`,
        buildApiRequest(body, token)
      );

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/admin");
      }

      return response;
    },
    [eventID, roundNum, navigate]
  );

  // ── Net Assignment Handlers ──
  const assignNetByRank = useCallback(async () => {
    setIsLoading(true);
    try {
      await postToApi("assign-net", {
        performances: orderedPerformances.map((p) => p._id),
        leftedPerformance: leftedPerformances.map((p) => p._id),
      });
      updateNets(true);
    } catch (error) {
      console.error("[assignNetByRank]", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderedPerformances, leftedPerformances, postToApi, updateNets]);

  const assignNetByPreRank = useCallback(async () => {
    setIsLoading(true);
    try {
      const urlSegment = ROUND_ASSIGN_URL_SEGMENTS[roundNum] ?? "assign-net";
      await postToApi(urlSegment, {
        performances: orderedPerformances.map((p) => p._id),
        leftedPerformance: leftedPerformances.map((p) => p._id),
      });
      updateNets(true);
    } catch (error) {
      console.error("[assignNetByPreRank]", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderedPerformances, leftedPerformances, roundNum, postToApi, updateNets]);

  const assignNetByPack = useCallback(async () => {
    setIsLoading(true);
    try {
      await postToApi("pack-assign-net", {
        performances,
        leftedPerformance: leftedPerformances,
      });
      updateNets(true);
    } catch (error) {
      console.error("[assignNetByPack]", error);
    } finally {
      setIsLoading(false);
    }
  }, [performances, leftedPerformances, postToApi, updateNets]);

  // ── Modal handlers ──
  const handleConfirmModalClose = useCallback(
    (hasExistingScore: boolean) => {
      setStatusMessage({ visible: true, isNegative: hasExistingScore });
      setIsConfirmModalOpen(false);

      if (!hasExistingScore) {
        switch (assignType) {
          case ASSIGN_TYPE.RANK:
            assignNetByRank();
            break;
          case ASSIGN_TYPE.PRERANK:
            assignNetByPreRank();
            break;
          case ASSIGN_TYPE.PACK:
            assignNetByPack();
            break;
        }
      }
    },
    [assignType, assignNetByRank, assignNetByPreRank, assignNetByPack]
  );

  // ── Rank Change Handler ──
  const handleRankChange = useCallback(
    (performanceId: string, newRank: number) => {
      setOrderedPerformances((prev) => {
        // Find the performance to move
        const sourceIndex = prev.findIndex((p) => p._id === performanceId);
        if (sourceIndex === -1) return prev;

        // Calculate target index (clamped to valid range)
        const targetIndex = Math.max(0, Math.min(newRank - 1, prev.length - 1));

        if (sourceIndex === targetIndex) return prev;

        // Create new array with moved item
        const reordered = [...prev];
        const [movedItem] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        // Update ranks for all items
        const rankedPerformances = reorderWithRanks(reordered);

        // Prepare payload for API
        const rankUpdates: RankUpdatePayload[] = rankedPerformances.map((p) => ({
          _id: p._id,
          rank: p.rank!,
        }));

        // Debounce the API call
        debouncedRankUpdate(rankUpdates);

        return rankedPerformances;
      });
    },
    [reorderWithRanks, debouncedRankUpdate]
  );

  // ── Participant management ──
  const handleLeftPerformance = useCallback(
    (e: React.MouseEvent, performanceId: string) => {
      e.preventDefault();

      const leavingPerformance = performances.find((p) => p._id === performanceId);
      if (!leavingPerformance) return;

      // Remove from active performances
      setPerformances((prev) => prev.filter((p) => p._id !== performanceId));

      // Remove from ordered and update ranks
      setOrderedPerformances((prev) => {
        const updated = prev.filter((p) => p._id !== performanceId);
        const ranked = reorderWithRanks(updated);

        // Update ranks on server
        const rankUpdates: RankUpdatePayload[] = ranked.map((p) => ({
          _id: p._id,
          rank: p.rank!,
        }));
        debouncedRankUpdate(rankUpdates);

        return ranked;
      });

      // Add to lefted performances
      setLeftedPerformances((prev) => [...prev, leavingPerformance]);
    },
    [performances, reorderWithRanks, debouncedRankUpdate]
  );

  const handleRecoverPerformance = useCallback(
    (e: React.MouseEvent, performanceId: string) => {
      e.preventDefault();

      const recoveringPerformance = leftedPerformances.find((p) => p._id === performanceId);
      if (!recoveringPerformance) return;

      // Remove from lefted
      setLeftedPerformances((prev) => prev.filter((p) => p._id !== performanceId));

      // Add to active performances
      const newPerformance = { ...recoveringPerformance, rank: undefined };

      setPerformances((prev) => [...prev, newPerformance]);
      setOrderedPerformances((prev) => {
        const updated = [...prev, newPerformance];
        const ranked = reorderWithRanks(updated);

        // Update ranks on server
        const rankUpdates: RankUpdatePayload[] = ranked.map((p) => ({
          _id: p._id,
          rank: p.rank!,
        }));
        debouncedRankUpdate(rankUpdates);

        return ranked;
      });
    },
    [leftedPerformances, reorderWithRanks, debouncedRankUpdate]
  );

  const handleSaveNewParticipant = useCallback(
    (res: any) => {
      const newPerformance: IPerformance = {
        event: eventID,
        pre_rank: 0,
        participant: {
          _id: res.participant._id,
          firstname: res.participant.firstname,
          lastname: res.participant.lastname,
        },
        _id: res.performance._id,
      };

      setPerformances((prev) => [...prev, newPerformance]);

      setOrderedPerformances((prev) => {
        const updated = [...prev, newPerformance];
        const ranked = reorderWithRanks(updated);

        // Update ranks on server
        const rankUpdates: RankUpdatePayload[] = ranked.map((p) => ({
          _id: p._id,
          rank: p.rank!,
        }));
        debouncedRankUpdate(rankUpdates);

        return ranked;
      });
    },
    [eventID, reorderWithRanks, debouncedRankUpdate]
  );

  // ── Drag-and-drop handlers ──
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number, id: string) => {
      setDraggedItem({ index, id });
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();

      if (!draggedItem) return;

      const draggedId = e.dataTransfer.getData("text/plain");
      const sourceIndex = orderedPerformances.findIndex((p) => p._id === draggedId);

      if (sourceIndex === -1 || sourceIndex === targetIndex) {
        setDraggedItem(null);
        return;
      }

      // Reorder performances
      const reordered = [...orderedPerformances];
      const [movedItem] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, movedItem);

      // Assign new ranks based on position
      const rankedPerformances = reorderWithRanks(reordered);
      setOrderedPerformances(rankedPerformances);
      setDraggedItem(null);

      // Prepare and send rank updates to server
      const rankUpdates: RankUpdatePayload[] = rankedPerformances.map((p) => ({
        _id: p._id,
        rank: p.rank!,
      }));

      debouncedRankUpdate(rankUpdates);
    },
    [draggedItem, orderedPerformances, reorderWithRanks, debouncedRankUpdate]
  );

  const handleDragEnd = useCallback(() => setDraggedItem(null), []);

  // ── Navigation ──
  const handleNextRound = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      activeItemHandler(e, roundNum + 1);
    },
    [activeItemHandler, roundNum]
  );

  const handleSubmitRound = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (refetchFunc) await refetchFunc();
    },
    [refetchFunc]
  );

  const toggleView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowPerformances((prev) => !prev);
  }, []);

  // ── Render ──
  return (
    <div className="SingleRound">
      <div className="all-btns-message-modal">
        <div className="rank-n-group my-3 w-full">
          <div>
            <button
              className="btn btn-primary"
              disabled={!showPerformances}
              // onClick={assignNetByPreRank}
              onClick={assignNetByRank}
            >
              {ASSIGN_BUTTON_LABELS[roundNum] ?? "Assign"}
            </button>
          </div>
          <ViewToggle showPerformances={showPerformances} onToggle={toggleView} />
        </div>

        <StatusMessage
          visible={statusMessage.visible}
          isNegative={statusMessage.isNegative}
        />

        <ScoreConfirmModal
          show={isConfirmModalOpen}
          onConfirm={handleConfirmModalClose}
        />
      </div>

      {showPerformances ? (
        <>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <h2 className="h2">All players</h2>
              <div
                className="table-responsive"
                style={{ height: "600px", overflow: "auto" }}
              >
                <table className="table table-striped table-hover">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th style={{ width: "280px" }}>Name</th>
                      <th>Ranking</th>
                      <th>Point</th>
                      <th>Point Differential</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedPerformances.map((performance, index) => (
                      <PerformanceTableRow
                        key={performance._id}
                        performance={performance}
                        index={index}
                        roundNum={roundNum}
                        isDragging={draggedItem?.id === performance._id}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onLeft={handleLeftPerformance}
                        onRankChange={handleRankChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <br />
              <br />
            </>
          )}

          {leftedPerformances.length > 0 && (
            <LeftedPefrormance concatinate onRecover={handleRecoverPerformance} performances={leftedPerformances} roundNum={roundNum} />
          )}

          <br />
          <br />

          <AddParticipant
            eventName={eventName}
            eventID={eventID}
            handleSaveParticipant={handleSaveNewParticipant}
          />
        </>
      ) : (
        <>
          {isLoading ? (
            <Loader />
          ) : (
            <div className="nets-table-wrapper">
              {nets.length > 0 ? (
                <NetOfARound
                  game={game}
                  nets={nets}
                  roundNum={roundNum}
                  rankPerformanceInNet={rankPerformanceInNet}
                  token={getAuthToken()}
                  eventID={eventID}
                  refetchFunc={refetchFunc}
                />
              ) : (
                <p className="text-center">
                  Participants have not been assigned yet!
                </p>
              )}
            </div>
          )}

          {roundNum <= 4 && (
            <>
              {incomepleteMessage && (
                <div className="alert alert-danger mt-3">
                  {incomepleteMessage}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleNextRound}
                  type="button"
                  className="btn btn-warning"
                >
                  Next Round
                </button>
                <button
                  onClick={handleSubmitRound}
                  type="button"
                  className="btn btn-success"
                >
                  Submit
                </button>
              </div>
            </>
          )}

          <div className="show table">
            <ShowLiftedPerformances
              leftedPerformances={leftedPerformances}
              onRecover={handleRecoverPerformance}
              roundNum={roundNum}
            />
          </div>
        </>
      )}
      <br />
    </div>
  );
}

export default SingleRound;