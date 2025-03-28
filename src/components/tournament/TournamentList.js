// src/components/tournament/TournamentList.js
import React, { useEffect } from 'react';
import useTournamentActions from '../../hooks/useTournamentActions';
import TournamentCard from './TournamentCard';
import './TournamentDetail.css';

function TournamentList() {
    const { tournaments, loading, fetchTournaments } = useTournamentActions();

    useEffect(() => {
        console.log('TournamentList useEffect triggered');
        fetchTournaments();
    }, [fetchTournaments]); // Added fetchTournaments to dependency array

    return (
        <div className="tournament-list-container">
            <div className="tournament-list-header">
                <h2>Tournaments</h2>
                <button className="create-tournament-btn" onClick={() => window.location.href = '/tournament-create'}>
                    Create Tournament
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : tournaments.length === 0 ? (
                <p>No tournaments available.</p>
            ) : (
                <div className="tournament-row">
                    {tournaments.map((tournament) => (
                        <TournamentCard key={tournament._id} tournament={tournament} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default TournamentList;