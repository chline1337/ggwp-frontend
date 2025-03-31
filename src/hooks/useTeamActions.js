// src/hooks/useTeamActions.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useTeamActions = () => {
    const [teams, setTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]); // New state for all teams
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTeams = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team/my-teams`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTeams(res.data);
        } catch (err) {
            alert(err.response?.data.msg || 'Error fetching teams');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const fetchAllTeams = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team`, { // New endpoint needed
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllTeams(res.data);
        } catch (err) {
            alert(err.response?.data.msg || 'Error fetching all teams');
        }
    }, [navigate]);

    const createTeam = useCallback(async (formData) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/team/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Team created successfully');
            navigate('/teams');
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to create team');
        }
    }, [navigate]);

    const sendInvite = useCallback(async (teamId, username) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/team/invite`, { teamId, username }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Invitation sent');
            await fetchTeams();
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to send invite');
        }
    }, [fetchTeams]);

    const respondToInvite = useCallback(async (teamId, accept) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/team/respond-invitation`,
                { teamId, accept },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(accept ? 'Joined team' : 'Declined invitation');
            await fetchTeams();
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to respond to invite');
        }
    }, [fetchTeams]);

    const deleteTeam = useCallback(async (teamId) => {
        const token = localStorage.getItem('token');
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/team/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Team deleted successfully');
                await fetchTeams();
            } catch (err) {
                alert(err.response?.data.msg || 'Failed to delete team');
            }
        }
    }, [fetchTeams]);

    useEffect(() => {
        fetchTeams();
        fetchAllTeams(); // Fetch all teams on mount
    }, [fetchTeams, fetchAllTeams]);

    return { teams, allTeams, loading, fetchTeams, fetchAllTeams, createTeam, sendInvite, respondToInvite, deleteTeam };
};

export default useTeamActions;