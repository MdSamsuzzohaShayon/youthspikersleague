import React, { useState, useEffect, useMemo, useCallback } from "react";
import { hostname } from "../../utils/global";
import Loader from "../elements/Loader";
import AddParticipant from "../participant/AddParticipant";
import { showLiftedPefrormance } from "../../utils/performance";
import { tabKeyFocusChange } from "../../utils/helpers";
import NetOfARound from "./NetOfARound";
import { IPerformance, IRound } from "../../types";
import { useNavigate } from "react-router-dom";
import { ASSIGN_BUTTON_LABELS, ASSIGN_TYPE, ROUND_ASSIGN_URL_SEGMENTS, type AssignType } from "../../utils/constants";
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




// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuthToken = (): string | null => localStorage.getItem("token");

const buildPostRequest = (body: object, token: string | null): RequestInit => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
});

// ─── Main Component ───────────────────────────────────────────────────────────

function SingleRound(props: SingleRoundProps) {
  const { roundNum, rankPerformanceInNet, eventID } = props;
  const navigate = useNavigate();

  // ── State ──
  const [isLoading, setIsLoading] = useState(false);
  const [performances, setPerformances] = useState<IPerformance[]>([]);
  const [orderedPerformances, setOrderedPerformances] = useState<IPerformance[]>([]);
  const [leftedPerformances, setLeftedPerformances] = useState<IPerformance[]>([]);
  const [showPerformances, setShowPerformances] = useState(true);
  const [assignType, setAssignType] = useState<AssignType | null>(null);

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Status notification state
  const [statusMessage, setStatusMessage] = useState<{ visible: boolean; isNegative: boolean }>({
    visible: false,
    isNegative: false,
  });

  // Drag-and-drop state
  const [draggedItem, setDraggedItem] = useState<DragState | null>(null);

  // ── Memoized values ──
  const nets = useMemo(() => props.round?.nets ?? [], [props.round]);

  console.log(props);
  

  // ── Effects ──
  useEffect(() => {
    setPerformances([...props.performances]);
    setOrderedPerformances([...props.performances]);
    setLeftedPerformances(props.leftRound);
    if (!props.round) setShowPerformances(false);
    setTimeout(tabKeyFocusChange, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!statusMessage.visible) return;
    const timer = setTimeout(
      () => setStatusMessage({ visible: false, isNegative: false }),
      3000
    );
    return () => clearTimeout(timer);
  }, [statusMessage.visible]);

  // ── API calls ──
  const postToApi = useCallback(
    async (urlSegment: string, body: object): Promise<Response> => {
      const token = getAuthToken();
      const response = await fetch(
        `${hostname}/api/net/${urlSegment}/${eventID}/${roundNum}`,
        buildPostRequest(body, token)
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

  const assignNetByRank = useCallback(async () => {
    setIsLoading(true);
    try {
      await postToApi("assign-net", { performances: performances.map((p)=> p._id), leftedPerformance: leftedPerformances.map((p)=> p._id) });
      props.updateNets(true);
    } catch (error) {
      console.error("[assignNetByRank]", error);
    } finally {
      setIsLoading(false);
    }
  }, [performances, leftedPerformances, postToApi, props]);

  const assignNetByPreRank = useCallback(async () => {
    setIsLoading(true);
    try {
      const urlSegment = ROUND_ASSIGN_URL_SEGMENTS[roundNum] ?? "assign-net";
      await postToApi(urlSegment, {
        performances: orderedPerformances.map((p)=> p._id),
        leftedPerformance: leftedPerformances.map((p)=> p._id),
      });
      props.updateNets(true);
    } catch (error) {
      console.error("[assignNetByPreRank]", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderedPerformances, leftedPerformances, roundNum, postToApi, props]);

  const assignNetByPack = useCallback(async () => {
    setIsLoading(true);
    try {
      await postToApi("pack-assign-net", { performances, leftedPerformance: leftedPerformances });
      props.updateNets(true);
    } catch (error) {
      console.error("[assignNetByPack]", error);
    } finally {
      setIsLoading(false);
    }
  }, [performances, leftedPerformances, postToApi, props]);

  // ── Modal handlers ──
  const handleConfirmModalClose = useCallback(
    (hasExistingScore: boolean) => {
      setStatusMessage({ visible: true, isNegative: hasExistingScore });
      setIsConfirmModalOpen(false);

      if (!hasExistingScore) {
        if (assignType === ASSIGN_TYPE.RANK) assignNetByRank();
        else if (assignType === ASSIGN_TYPE.PRERANK) assignNetByPreRank();
        else if (assignType === ASSIGN_TYPE.PACK) assignNetByPack();
      }
    },
    [assignType, assignNetByRank, assignNetByPreRank, assignNetByPack]
  );

  // ── Participant management ──
  const handleLeftPerformance = useCallback(
    (e: React.MouseEvent, performanceId: string) => {
      e.preventDefault();
      const leaving = performances.find((p) => p._id === performanceId);
      if (!leaving) return;
      setPerformances((prev) => prev.filter((p) => p._id !== performanceId));
      setOrderedPerformances((prev) => prev.filter((p) => p._id !== performanceId));
      setLeftedPerformances((prev) => [...prev, leaving]);
    },
    [performances]
  );

  const handleRecoverPerformance = useCallback(
    (e: React.MouseEvent, performanceId: string) => {
      e.preventDefault();
      const recovering = leftedPerformances.find((p) => p._id === performanceId);
      if (!recovering) return;
      setPerformances((prev) => [...prev, recovering]);
      setOrderedPerformances((prev) => [...prev, recovering]);
      setLeftedPerformances((prev) => prev.filter((p) => p._id !== performanceId));
    },
    [leftedPerformances]
  );

  const handleSaveNewParticipant = useCallback((res: any) => {
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
    setOrderedPerformances((prev) => [...prev, newPerformance]);
  }, [eventID]);

  // ── Drag-and-drop handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, index: number, id: string) => {
    setDraggedItem({ index, id });
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

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
      if (sourceIndex === -1) return;

      const reordered = [...orderedPerformances];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      setOrderedPerformances(reordered);
      setDraggedItem(null);
    },
    [draggedItem, orderedPerformances]
  );

  const handleDragEnd = useCallback(() => setDraggedItem(null), []);

  const handleRankInputChange = useCallback(
    (index: number, newRanking: number) => {
      const reordered = [...orderedPerformances];
      const [item] = reordered.splice(index, 1);
      reordered.splice(Math.min(newRanking - 1, reordered.length), 0, item);
      setOrderedPerformances(reordered);
    },
    [orderedPerformances]
  );

  // ── Navigation ──
  const handleNextRound = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      props.activeItemHandler(e, roundNum + 1);
    },
    [props, roundNum]
  );

  const handleSubmitRound = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (props.refetchFunc) await props.refetchFunc();
    },
    [props]
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
              onClick={assignNetByPreRank}
            >
              {ASSIGN_BUTTON_LABELS[roundNum] ?? "Assign"}
            </button>
          </div>
          <ViewToggle showPerformances={showPerformances} onToggle={toggleView} />
        </div>

        <StatusMessage visible={statusMessage.visible} isNegative={statusMessage.isNegative} />

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
              <h2 className="h2">All players in the tournament</h2>
              <div className="table-responsive" style={{ height: "600px", overflow: "auto" }}>
                <table className="table table-striped table-hover">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
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
                        orderedPerformances={orderedPerformances}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onLeft={handleLeftPerformance}
                        onRankChange={handleRankInputChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <br />
              <br />
            </>
          )}
          {showLiftedPefrormance(leftedPerformances, roundNum, handleRecoverPerformance, true)}
          <br />
          <br />
          <AddParticipant
            roundNum={roundNum}
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
              <NetOfARound
                game={props.game}
                nets={nets}
                roundNum={roundNum}
                rankPerformanceInNet={rankPerformanceInNet}
                token={getAuthToken()}
                eventID={eventID}
                refetchFunc={props.refetchFunc}
              />
            </div>
          )}
          {roundNum <= 4 && (
            <>
              {props.incomepleteMessage && (
                <div className="alert alert-danger mt-3">{props.incomepleteMessage}</div>
              )}
              <div className="text-md-center">
                <button onClick={handleNextRound} type="button" className="btn btn-warning">
                  Next Round
                </button>
                <button onClick={handleSubmitRound} type="button" className="btn btn-success">
                  Submit
                </button>
              </div>
            </>
          )}
          <div className="show table">
            {/* {showLiftedPefrormance(leftedPerformances, roundNum, null, false)} */}
            <ShowLiftedPerformances leftedPerformances={leftedPerformances} onRecover={handleRecoverPerformance} roundNum={roundNum} />
          </div>
        </>
      )}
      <br />
    </div>
  );
}

export default SingleRound;