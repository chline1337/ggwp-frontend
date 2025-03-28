import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './TournamentDetail.css';

function TournamentDetail() {
    const [tournament, setTournament] = useState(null);
    const [signupForm, setSignupForm] = useState({ teamId: '' });
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const bracketRef = useRef(null);

    useEffect(() => {
        const fetchTournamentAndUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const [tournamentRes, usersRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const selectedTournament = tournamentRes.data.find(t => t._id === id);
                if (!selectedTournament) throw new Error('Tournament not found');
                setTournament(selectedTournament);
                setUsers(usersRes.data);
            } catch (err) {
                alert(err.message || err.response.data.msg);
                navigate('/tournaments');
            }
        };
        fetchTournamentAndUsers();
    }, [id, navigate]);

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const signup = async (isTeam) => {
        const token = localStorage.getItem('token');
        try {
            const payload = isTeam ? { tournamentId: tournament._id, teamId: signupForm.teamId } : { tournamentId: tournament._id };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Signed up successfully');
            refreshTournament();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const addUserToTournament = async () => {
        if (!selectedUserId) {
            alert('Please select a user');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, {
                tournamentId: tournament._id,
                userId: selectedUserId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('User added successfully');
            setSelectedUserId('');
            refreshTournament();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const startTournament = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/start`, { tournamentId: tournament._id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Tournament started');
            refreshTournament();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const updateResult = async (matchId, winnerId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/result`, {
                tournamentId: tournament._id,
                matchId,
                winnerId
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Result updated');
            refreshTournament();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const refreshTournament = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const selectedTournament = res.data.find(t => t._id === id);
        setTournament(selectedTournament);
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

    const currentUserId = localStorage.getItem('userId');

    if (!tournament) return <p>Loading...</p>;

    return (
        <div className="tournament-detail-container">
            <div className="tournament-card">
                <h3>{tournament.name} ({tournament.game})</h3>
                <p>Format: {tournament.format.replace('_', ' ')} | Type: {tournament.participantType}</p>
                <p>Organizer: {tournament.organizer.username} | Status: {tournament.status}</p>
                <div className="participants-list">
                    <h4>Participants</h4>
                    <ul>
                        {tournament.participants.map((p, index) => (
                            <li key={index}>{p ? (p.username || p.name) : 'TBD'}</li>
                        ))}
                    </ul>
                </div>
                {tournament.status === 'open' && (
                    <>
                        {tournament.participantType === 'user' ? (
                            <button onClick={() => signup(false)}>Sign Up</button>
                        ) : (
                            <form className="signup-form" onSubmit={(e) => { e.preventDefault(); signup(true); }}>
                                <input
                                    type="text"
                                    name="teamId"
                                    placeholder="Team ID"
                                    value={signupForm.teamId}
                                    onChange={handleSignupChange}
                                />
                                <button type="submit">Sign Up Team</button>
                            </form>
                        )}
                        {tournament.organizer._id.toString() === currentUserId && tournament.participantType === 'user' && (
                            <div className="add-user-form">
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="user-select"
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>{user.username}</option>
                                    ))}
                                </select>
                                <button onClick={addUserToTournament}>Add User</button>
                            </div>
                        )}
                    </>
                )}
                {tournament.organizer._id.toString() === currentUserId && tournament.status === 'open' && (
                    <button onClick={startTournament}>Start Tournament</button>
                )}
                {tournament.status === 'started' && (
                    <>
                        {tournament.format === 'single_elimination' && (
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
                                                    {tournament.organizer._id.toString() === currentUserId && !match.winner && (
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
                        )}
                        {tournament.format === 'group_stage' && (
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
                                                        {tournament.organizer._id.toString() === currentUserId && !match.winner && (
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default TournamentDetail;