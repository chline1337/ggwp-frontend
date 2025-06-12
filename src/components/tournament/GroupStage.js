// src/components/tournament/GroupStage.js
import React from 'react';
import axios from 'axios';

function GroupStage({ tournament, isOrganizer, refreshTournament }) {
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

    const getGroups = (matches, standings) => {
        const groups = {};
        matches.forEach(match => {
            if (!groups[match.group]) {
                groups[match.group] = { matches: [], standings: [] };
            }
            groups[match.group].matches.push(match);
        });
        standings.forEach(standing => {
            if (groups[standing.group]) {
                groups[standing.group].standings.push(standing);
            }
        });
        return groups;
    };

    return (
        <div className="group-stage">
            <h4>Group Stage</h4>
            {Object.entries(getGroups(tournament.matches, tournament.standings)).map(([groupName, groupData]) => (
                <div key={groupName} className="group">
                    <h5>{groupName}</h5>
                    <div className="standings">
                        <h6>Standings</h6>
                        <table className="standings-table">
                            <thead>
                                <tr>
                                    <th>Participant</th>
                                    <th>Wins</th>
                                    <th>Losses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupData.standings.map((standing, index) => (
                                    <tr key={index}>
                                        <td>{standing.participant ? (standing.participant.username || standing.participant.name) : 'TBD'}</td>
                                        <td>{standing.wins}</td>
                                        <td>{standing.losses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="group-matches">
                        <h6>Matches</h6>
                        <ul>
                            {groupData.matches.map((match) => (
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
                </div>
            ))}
        </div>
    );
}

export default GroupStage;