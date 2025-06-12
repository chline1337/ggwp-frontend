// src/components/tournament/Bracket.js
import React, { useRef } from 'react';
import axios from 'axios';

function Bracket({ tournament, isOrganizer, refreshTournament }) {
    const bracketRef = useRef(null);

    const updateResult = async (matchId, winnerId) => {
        const token = localStorage.getItem('token');
        console.log('Updating result:', { tournamentId: tournament._id, matchId, winnerId, token });
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/tournaments/result`, {
                tournamentId: tournament._id,
                matchId,
                winnerId
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Result updated successfully:', res.data);
            alert('Result updated');
            refreshTournament();
        } catch (err) {
            console.error('Failed to update result:', err.response?.data.msg || err.message);
            alert(err.response?.data.msg || 'Failed to update result');
        }
    };

    const getRounds = (matches, maxParticipants) => {
        const rounds = [];
        const totalRounds = Math.log2(maxParticipants);
        let start = 0;
        for (let i = 0; i < totalRounds; i++) {
            const roundSize = maxParticipants / Math.pow(2, i);
            const end = start + roundSize / 2;
            rounds.push(matches.slice(start, end));
            start = end;
        }
        return rounds;
    };

    const renderConnectors = () => {
        const connectors = [];
        const rounds = getRounds(tournament.matches, tournament.maxParticipants);
        const bracketEl = bracketRef.current;
        if (!bracketEl) return connectors;

        rounds.forEach((round, roundIndex) => {
            const roundEl = bracketEl.querySelector(`.round-${roundIndex}`);
            const nextRoundEl = bracketEl.querySelector(`.round-${roundIndex + 1}`);
            if (!roundEl || !nextRoundEl) return;

            const matches = roundEl.querySelectorAll('.match');
            const nextMatches = nextRoundEl.querySelectorAll('.match');

            matches.forEach((matchEl, matchIndex) => {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatchEl = nextMatches[nextMatchIndex];
                if (!nextMatchEl) return;

                const matchRect = matchEl.getBoundingClientRect();
                const nextMatchRect = nextMatchEl.getBoundingClientRect();
                const bracketRect = bracketEl.getBoundingClientRect();

                const x1 = matchRect.right - bracketRect.left + 10;
                const y1 = matchRect.top + matchRect.height / 2 - bracketRect.top;
                const x2 = nextMatchRect.left - bracketRect.left - 10;
                const y2 = nextMatchRect.top + nextMatchRect.height / 2 - bracketRect.top;

                connectors.push(
                    <path
                        key={`connector-${roundIndex}-${matchIndex}`}
                        d={`M ${x1},${y1} C ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                        stroke="#888"
                        strokeWidth="2"
                        fill="none"
                    />
                );
            });
        });

        return connectors;
    };

    return (
        <div className="bracket" ref={bracketRef}>
            <h4>Bracket</h4>
            <svg className="bracket-connectors" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {renderConnectors()}
            </svg>
            {getRounds(tournament.matches, tournament.maxParticipants).map((round, roundIndex) => (
                <div
                    key={roundIndex}
                    className={`round round-${roundIndex} ${roundIndex > 1 ? 'centered-round' : ''}`}
                >
                    <h5>Round {roundIndex + 1}</h5>
                    <ul>
                        {round.map((match) => (
                            <li key={match._id} className="match">
                                <span className="participant">
                                    {match.participant1 ? (match.participant1.username || match.participant1.name) : 'TBD'}
                                </span>
                                <span className="vs">vs</span>
                                <span className="participant">
                                    {match.participant2 ? (match.participant2.username || match.participant2.name) : 'TBD'}
                                </span>
                                <span className="result">
                                    - Winner: {match.winner ? (match.winner.username || match.winner.name) : 'Pending'}
                                </span>
                                {isOrganizer && !match.winner && (
                                    <div className="actions">
                                        {match.participant1 && (
                                            <button onClick={() => updateResult(match._id, match.participant1._id)}>
                                                {match.participant1.username || match.participant1.name} Wins
                                            </button>
                                        )}
                                        {match.participant2 && (
                                            <button onClick={() => updateResult(match._id, match.participant2._id)}>
                                                {match.participant2.username || match.participant2.name} Wins
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default Bracket;