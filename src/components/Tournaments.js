import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Tournaments.css';

function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [signupForm, setSignupForm] = useState({ tournamentId: '', teamId: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournaments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTournaments(res.data);
            } catch (err) {
                alert(err.response.data.msg);
            }
        };
        fetchTournaments();
    }, [navigate]);

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const signup = async (tournamentId, isTeam) => {
        const token = localStorage.getItem('token');
        try {
            const payload = isTeam ? signupForm : { tournamentId };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Signed up successfully');
            refreshTournaments();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const startTournament = async (tournamentId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/start`, { tournamentId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Tournament started');
            refreshTournaments();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const updateResult = async (tournamentId, matchId, winnerId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/result`, { tournamentId, matchId, winnerId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Result updated');
            refreshTournaments();
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const refreshTournaments = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setTournaments(res.data);
    };

    const getRounds = (matches) => {
        const rounds = [];
        let roundSize = Math.ceil(matches.length / 2) + 1;
        let currentRound = [];
        matches.forEach((match, index) => {
            currentRound.push(match);
            if (currentRound.length === roundSize || index === matches.length - 1) {
                rounds.push([...currentRound]);
                currentRound = [];
                roundSize = Math.ceil(roundSize / 2);
            }
        });
        return rounds;
    };

    const currentUserId = localStorage.getItem('userId');

    return (
        <div className="tournaments-container">
            <button className="create-tournament-btn" onClick={() => navigate('/tournament-create')}>Create Tournament</button>
            {tournaments.map((tournament) => (
                <div key={tournament._id} className="tournament-card">
                    <h3>{tournament.name} ({tournament.game})</h3>
                    <p>Format: {tournament.format.replace('_', ' ')} | Type: {tournament.participantType}</p>
                    <p>Organizer: {tournament.organizer.username} | Status: {tournament.status}</p>
                    <div className="participants-list">
                        <h4>Participants</h4>
                        <ul>
                            {tournament.participants.map((p, index) => (
                                <li key={index}>{p ? (p.username || p.name) : 'Bye'}</li>
                            ))}
                        </ul>
                    </div>
                    {tournament.status === 'open' && (
                        tournament.participantType === 'user' ? (
                            <button onClick={() => signup(tournament._id, false)}>Sign Up</button>
                        ) : (
                            <form className="signup-form" onSubmit={(e) => { e.preventDefault(); signup(tournament._id, true); }}>
                                <input
                                    type="text"
                                    name="teamId"
                                    placeholder="Team ID"
                                    onChange={handleSignupChange}
                                />
                                <button type="submit">Sign Up Team</button>
                            </form>
                        )
                    )}
                    {tournament.organizer._id.toString() === currentUserId && tournament.status === 'open' && (
                        <button onClick={() => startTournament(tournament._id)}>Start Tournament</button>
                    )}
                    {tournament.status === 'started' && tournament.format === 'single_elimination' && (
                        <div className="bracket">
                            <h4>Bracket</h4>
                            {getRounds(tournament.matches).map((round, roundIndex) => (
                                <div key={roundIndex} className="round">
                                    <h5>Round {roundIndex + 1}</h5>
                                    <ul>
                                        {round.map((match) => (
                                            <li key={match._id} className="match">
                                                <span className="participant">
                                                    {match.participant1 ? (match.participant1.username || match.participant1.name) : 'Bye'}
                                                </span>
                                                <span className="vs">vs</span>
                                                <span className="participant">
                                                    {match.participant2 ? (match.participant2.username || match.participant2.name) : 'Bye'}
                                                </span>
                                                <span className="result">
                                                    - Winner: {match.winner ? (match.winner.username || match.winner.name) : 'Pending'}
                                                </span>
                                                {tournament.organizer._id.toString() === currentUserId && !match.winner && (
                                                    <div className="actions">
                                                        {match.participant1 && (
                                                            <button onClick={() => updateResult(tournament._id, match._id, match.participant1._id)}>
                                                                {match.participant1.username || match.participant1.name} Wins
                                                            </button>
                                                        )}
                                                        {match.participant2 && (
                                                            <button onClick={() => updateResult(tournament._id, match._id, match.participant2._id)}>
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
                </div>
            ))}
        </div>
    );
}

export default Tournaments;