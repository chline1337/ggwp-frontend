import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './TournamentList.css';

function TournamentList() {
    const [tournaments, setTournaments] = useState([]);
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

    return (
        <div className="tournament-list-container">
            <div className="tournament-list-header">
                <h2>Tournaments</h2>
                <button className="create-tournament-btn" onClick={() => navigate('/tournament-create')}>
                    Create Tournament
                </button>
            </div>
            <div className="tournament-row">
                {tournaments.map((tournament) => (
                    <Link key={tournament._id} to={`/tournaments/${tournament._id}`} className="tournament-card-link">
                        <div className="tournament-card">
                            <h3>{tournament.name}</h3>
                            <p>Game: {tournament.game}</p>
                            <p>Format: {tournament.format.replace('_', ' ')}</p>
                            <p>Type: {tournament.participantType}</p>
                            <p>Status: {tournament.status}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default TournamentList;