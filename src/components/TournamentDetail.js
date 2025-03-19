import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './TournamentDetail.css';

function TournamentDetail() {
    const [tournament, setTournament] = useState(null);
    const [signupForm, setSignupForm] = useState({ teamId: '' });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchTournament = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const selectedTournament = res.data.find(t => t._id === id);
                if (!selectedTournament) throw new Error('Tournament not found');
                setTournament(selectedTournament);
            } catch (err) {
                alert(err.message || err.response.data.msg);
                navigate('/tournaments');
            }
        };
        fetchTournament();
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
                            <li key={index}>{p ? (p.username || p.name) : 'Bye'}</li>
                        ))}
                    </ul>
                </div>
                {tournament.status === 'open' && (
                    tournament.participantType === 'user' ? (
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
                    )
                )}
                {tournament.organizer._id.toString() === currentUserId && tournament.status === 'open' && (
                    <button onClick={startTournament}>Start Tournament</button>
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
            </div>
        </div>
    );
}

export default TournamentDetail;