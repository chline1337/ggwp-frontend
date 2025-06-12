// src/hooks/useTournamentActions.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../services/tournaments';

const useTournamentActions = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchTournaments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await tournamentService.getTournaments();
            
            if (result.success) {
                setTournaments(result.data);
            } else {
                setError(result.error);
                setTournaments([]);
            }
        } catch (err) {
            console.error('Error fetching tournaments:', err);
            setError('Unexpected error occurred while loading tournaments');
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTournament = useCallback(async (tournamentData) => {
        try {
            const result = await tournamentService.createTournament(tournamentData);
            
            if (result.success) {
                // Refresh tournaments list
                await fetchTournaments();
                navigate('/tournaments');
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error creating tournament:', err);
            throw err;
        }
    }, [fetchTournaments, navigate]);

    const updateTournament = useCallback(async (tournamentId, tournamentData) => {
        try {
            const result = await tournamentService.updateTournament(tournamentId, tournamentData);
            
            if (result.success) {
                // Update local tournaments state
                setTournaments(prev => 
                    prev.map(tournament => 
                        tournament._id === tournamentId ? result.data : tournament
                    )
                );
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error updating tournament:', err);
            throw err;
        }
    }, []);

    const deleteTournament = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.deleteTournament(tournamentId);
            
            if (result.success) {
                // Remove tournament from local state
                setTournaments(prev => 
                    prev.filter(tournament => tournament._id !== tournamentId)
                );
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error deleting tournament:', err);
            throw err;
        }
    }, []);

    const startTournament = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.startTournament(tournamentId);
            
            if (result.success) {
                // Update tournament status in local state
                setTournaments(prev => 
                    prev.map(tournament => 
                        tournament._id === tournamentId 
                            ? { ...tournament, status: 'ongoing' } 
                            : tournament
                    )
                );
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error starting tournament:', err);
            throw err;
        }
    }, []);

    const joinTournament = useCallback(async (tournamentId, participantData = {}) => {
        try {
            const result = await tournamentService.joinTournament(tournamentId, participantData);
            
            if (result.success) {
                // Refresh tournaments to get updated participant data
                await fetchTournaments();
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error joining tournament:', err);
            throw err;
        }
    }, [fetchTournaments]);

    const leaveTournament = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.leaveTournament(tournamentId);
            
            if (result.success) {
                // Refresh tournaments to get updated participant data
                await fetchTournaments();
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error leaving tournament:', err);
            throw err;
        }
    }, [fetchTournaments]);

    const getTournament = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.getTournament(tournamentId);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error getting tournament:', err);
            throw err;
        }
    }, []);

    const getTournamentParticipants = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.getTournamentParticipants(tournamentId);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error getting tournament participants:', err);
            throw err;
        }
    }, []);

    const getTournamentBrackets = useCallback(async (tournamentId) => {
        try {
            const result = await tournamentService.getTournamentBrackets(tournamentId);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error getting tournament brackets:', err);
            throw err;
        }
    }, []);

    return {
        // State
        tournaments,
        loading,
        error,
        
        // Actions
        fetchTournaments,
        createTournament,
        updateTournament,
        deleteTournament,
        startTournament,
        joinTournament,
        leaveTournament,
        getTournament,
        getTournamentParticipants,
        getTournamentBrackets
    };
};

export default useTournamentActions;