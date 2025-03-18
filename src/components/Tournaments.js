import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTournaments(res.data);
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
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTournaments(res.data);
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
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTournaments(res.data);
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const currentUserId = localStorage.getItem('userId');

    return (
        <div>
            <h2>Tournaments</h2>
            <button onClick={() => navigate('/tournament-create')}>Create Tournament</button>
            {tournaments.map((tournament) => (
                <div key={tournament._id}>
                    <h3>{tournament.name} ({tournament.game})</h3>
                    <p>Format: {tournament.format.replace('_', ' ')} | Type: {tournament.participantType}</p>
                    <p>Organizer: {tournament.organizer.username} | Status: {tournament.status}</p>
                    <h4>Participants</h4>
                    <ul>
                        {tournament.participants.map((p, index) => (
                            <li key={index}>{p.username || p.name}</li>
                        ))}
                    </ul>
                    {tournament.status === 'open' && (
                        tournament.participantType === 'user' ? (
                            <button onClick={() => signup(tournament._id, false)}>Sign Up</button>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); signup(tournament._id, true); }}>
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
                    {tournament.status === 'started' && (
                        <>
                            <h4>Matches</h4>
                            <ul>
                                {tournament.matches.map((match) => (
                                    <li key={match._id}>
                                        {match.participant1 ? match.participant1.username || match.participant1.name : 'TBD'} vs{' '}
                                        {match.participant2 ? match.participant2.username || match.participant2.name : 'TBD'} -{' '}
                                        Winner: {match.winner ? match.winner.username || match.winner.name : 'Pending'}
                                        {tournament.organizer._id.toString() === currentUserId && !match.winner && (
                                            <>
                                                <button onClick={() => updateResult(tournament._id, match._id, match.participant1._id)}>
                                                    {match.participant1.username || match.participant1.name} Wins
                                                </button>
                                                {match.participant2 && (
                                                    <button onClick={() => updateResult(tournament._id, match._id, match.participant2._id)}>
                                                        {match.participant2.username || match.participant2.name} Wins
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Tournaments;