// src/hooks/useTournament.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useTournament = (tournamentId) => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTournament = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const selectedTournament = res.data.find(t => t._id === tournamentId);
      if (!selectedTournament) throw new Error('Tournament not found');
      setTournament(selectedTournament);
    } catch (err) {
      alert(err.message || err.response?.data.msg || 'Error fetching tournament');
      navigate('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const refreshTournament = async () => {
    await fetchTournament();
  };

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  return { tournament, loading, refreshTournament };
};

export default useTournament;