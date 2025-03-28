// src/hooks/useTournamentActions.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useTournamentActions = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTournaments = useCallback(async () => {
        const token = localStorage.getItem('token');
        console.log('Fetching tournaments, token:', token);
        if (!token) {
            console.log('No token, navigating to /login');
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            console.log('Making API call to /api/tournament');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('API response:', res.data);
            setTournaments(res.data);
        } catch (err) {
            console.error('Error fetching tournaments:', err.response?.data.msg || err.message);
            alert(err.response?.data.msg || 'Error fetching tournaments');
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    }, [navigate]); // Keep navigate here as it’s used in the function

    const createTournament = async (formData) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Tournament created');
            navigate('/tournaments');
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to create tournament');
        }
    };

    const startTournament = useCallback(async (tournamentId) => {
        const token = localStorage.getItem('token');
        console.log('Starting tournament, ID:', tournamentId, 'Token:', token);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/start`, { tournamentId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Tournament started successfully');
            alert('Tournament started');
            return true;
        } catch (err) {
            console.error('Error starting tournament:', err.response?.data.msg || err.message);
            alert(err.response?.data.msg || 'Failed to start tournament');
            return false;
        }
    }, []); // Removed navigate from dependencies as it’s stable

    return { tournaments, loading, fetchTournaments, createTournament, startTournament };
};

export default useTournamentActions;