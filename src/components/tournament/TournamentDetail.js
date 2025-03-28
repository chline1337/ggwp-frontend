// src/components/tournament/TournamentDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import useTournament from '../../hooks/useTournament';
import useUsers from '../../hooks/useUsers';
import useTournamentActions from '../../hooks/useTournamentActions';
import TournamentHeader from './TournamentHeader';
import ParticipantsList from './ParticipantsList';
import SignupForm from './SignupForm';
import AddUserForm from './AddUserForm';
import Bracket from './Bracket';
import GroupStage from './GroupStage';
import './TournamentDetail.css';

function TournamentDetail() {
    const { id } = useParams();
    const { tournament, loading, refreshTournament } = useTournament(id);
    const { startTournament } = useTournamentActions();
    const users = useUsers();
    const currentUserId = localStorage.getItem('userId');

    if (loading) return <p>Loading...</p>;
    if (!tournament) return null;

    const isOrganizer = tournament.organizer._id.toString() === currentUserId;

    const handleStartTournament = async () => {
        const success = await startTournament(id);
        if (success) refreshTournament();
    };

    return (
        <div className="tournament-detail-container">
            <div className="tournament-card">
                <TournamentHeader tournament={tournament} />
                <ParticipantsList participants={tournament.participants} />
                {tournament.status === 'open' && (
                    <>
                        <SignupForm tournament={tournament} refreshTournament={refreshTournament} />
                        {isOrganizer && tournament.participantType === 'user' && (
                            <AddUserForm
                                tournamentId={tournament._id}
                                users={users}
                                refreshTournament={refreshTournament}
                            />
                        )}
                    </>
                )}
                {isOrganizer && tournament.status === 'open' && (
                    <button onClick={handleStartTournament}>Start Tournament</button>
                )}
                {tournament.status === 'started' && (
                    <>
                        {tournament.format === 'single_elimination' && (
                            <Bracket
                                tournament={tournament}
                                isOrganizer={isOrganizer}
                                refreshTournament={refreshTournament}
                            />
                        )}
                        {tournament.format === 'group_stage' && (
                            <GroupStage
                                tournament={tournament}
                                isOrganizer={isOrganizer}
                                refreshTournament={refreshTournament}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default TournamentDetail;