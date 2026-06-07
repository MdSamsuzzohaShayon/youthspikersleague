import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SingleRound from './SingleRound';
import { hostname } from '../../utils/global';
import { checkRoundCompleted } from '../../utils/helpers';
import Loader from '../elements/Loader';
import "../../style/Rounds.css";
import { IPerformance, IRound } from '../../types';

// Sub-component for round navigation tabs
interface RoundTabProps {
    roundNumber: number;
    currentRound: number;
    onClick: (e: React.MouseEvent, round: number) => void;
}

const RoundTab: React.FC<RoundTabProps> = ({ roundNumber, currentRound, onClick }) => {
    const isActive = currentRound === roundNumber;
    return (
        <button 
            className={isActive ? "nav-link active" : "nav-link"} 
            onClick={(e) => onClick(e, roundNumber)}
            role="tab"
        >
            Round {roundNumber}
        </button>
    );
};

// Sub-component for error message display
interface ErrorMessageProps {
    message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    return <div className="alert alert-danger mt-2 mb-0">{message}</div>;
};

// Constants for game numbers per round
const GAME_NUMBERS_BY_ROUND: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
    5: [13, 14, 15],
    // 6: [16, 17, 18]
};

interface IRoundsProps {
    eventID: string;
    eventName: string | null;
}

const Rounds = ({ eventName, eventID }: IRoundsProps) => {
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [incompleteMessage, setIncompleteMessage] = useState<string | null>(null);
    const [isInitialRound, setIsInitialRound] = useState<boolean>(false);
    const [selectedRoundData, setSelectedRoundData] = useState<IRound | null>(null);
    const [leftRoundParticipants, setLeftRoundParticipants] = useState<IPerformance[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [performances, setPerformances] = useState<IPerformance[]>([]);
    const [rankedParticipantsInNets, setRankedParticipantsInNets] = useState([]);
    const [incompleteNets, setIncompleteNets] = useState<number[]>([]);

    // Format incomplete nets numbers into readable message
    const formatIncompleteNetsMessage = useCallback((netNumbers: number[]): string => {
        if (netNumbers.length === 0) return '';
        return netNumbers.join(', ');
    }, []);

    // Handle round navigation
    const handleRoundChange = useCallback(async (e: React.MouseEvent, targetRound: number) => {
        e.preventDefault();
        

        // Validate if we can move to next round
        if (targetRound <= 5 && targetRound > currentRound && selectedRoundData?.nets) {
            const { complete, incomplete } = checkRoundCompleted(currentRound, selectedRoundData.nets);
            
            if (incomplete.length > 0) {
                setIncompleteNets(incomplete);
                return;
            }
        }

        // Navigate to the target round
        setCurrentRound(targetRound);
        await fetchRoundData(targetRound);
    }, [currentRound, selectedRoundData]);

    // Fetch round data from API
    const fetchRoundData = useCallback(async (roundNumber: number) => {
        try {
            setIsLoading(true);
            
            const response = await fetch(
                `${hostname}/api/round/get-single-round/${eventID}/${roundNumber}`,
                { method: 'GET', headers: { "Content-Type": "application/json" } }
            );
        
            const responseData = await response.json();
            

            // Update participants
            if (responseData.performances?.length > 0) {
                setPerformances(responseData.performances);
            }

            // Update left round participants
            if (responseData.leftRound?.length > 0) {
                setLeftRoundParticipants([...responseData.leftRound]);
            }

            // Update round data
            if (responseData.findRound) {
                setSelectedRoundData(responseData.findRound);
                setRankedParticipantsInNets(responseData.rankNets || []);
                setIsInitialRound(!responseData.findRound.nets?.length);
            } else {
                setSelectedRoundData(null);
                setIsInitialRound(true);
            }

        } catch (error) {
            console.error(`Error fetching round ${roundNumber}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [eventID]);

    // Refetch current round data
    const refetchCurrentRound = useCallback(async () => {
        await fetchRoundData(currentRound);
    }, [currentRound, fetchRoundData]);

    // Handle net updates
    const handleNetUpdate = useCallback((shouldUpdate: boolean) => {
        if (shouldUpdate) {
            fetchRoundData(currentRound);
        }
    }, [currentRound, fetchRoundData]);

    // Effect for initial data fetch
    useEffect(() => {
        fetchRoundData(1);
    }, []); 

    // Effect for handling incomplete nets error message
    useEffect(() => {
        if (incompleteNets.length === 0) {
            setIncompleteMessage(null);
            return;
        }

        const formattedNets = formatIncompleteNetsMessage(incompleteNets);
        setIncompleteMessage(
            `Please complete all games in net ${formattedNets} to go to next round`
        );

        const timer = setTimeout(() => {
            setIncompleteNets([]);
            setIncompleteMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [incompleteNets, formatIncompleteNetsMessage]);

    // Memoized game numbers for current round
    const currentRoundGames = useMemo(
        () => GAME_NUMBERS_BY_ROUND[currentRound] || [],
        [currentRound]
    );

    // Render single round component with props
    const renderSingleRound = () => {
        if (isLoading) {
            return <Loader />;
        }

        // Don't render if no round data for rounds beyond 5
        if (currentRound > 5) {
            return <div className="tab-pane fade show active">Event overview</div>;
        }

        

        return (
            <div className="tab-pane fade show active">
                <SingleRound
                    incomepleteMessage={incompleteMessage}
                    initialize={isInitialRound}
                    activeItemHandler={handleRoundChange}
                    performances={performances}
                    round={selectedRoundData}
                    rankPerformanceInNet={rankedParticipantsInNets}
                    roundNum={currentRound}
                    updateNets={handleNetUpdate}
                    leftRound={leftRoundParticipants}
                    game={currentRoundGames}
                    refetchFunc={refetchCurrentRound}
                    eventID={eventID}
                    eventName={eventName}
                />
            </div>
        );
    };

    return (
        <div className="Rounds">
            <nav className="nav nav-pills bg-dark">
                {[1, 2, 3, 4, 5].map(round => (
                    <RoundTab
                        key={round}
                        roundNumber={round}
                        currentRound={currentRound}
                        onClick={handleRoundChange}
                    />
                ))}
            </nav>
            
            <ErrorMessage message={incompleteMessage} />
            
            <div className="tab-content">
                {renderSingleRound()}
            </div>
        </div>
    );
};

export default Rounds;