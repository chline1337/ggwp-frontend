// src/hooks/useTournament.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../services/tournaments';

const useTournament = (tournamentId) => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await tournamentService.getTournament(tournamentId);
      
      if (result.success) {
        setTournament(result.data);
      } else {
        setError(result.error || 'Failed to load tournament');
        // Navigate back to tournaments list if tournament not found
        setTimeout(() => navigate('/tournaments'), 2000);
      }
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Error fetching tournament');
      setTimeout(() => navigate('/tournaments'), 2000);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, navigate]);

  const refreshTournament = useCallback(async () => {
    await fetchTournament();
  }, [fetchTournament]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return { tournament, loading, error, refreshTournament };
};

export default useTournament;