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
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            // For now, we'll use the same endpoint as fetchAllTeams since backend doesn't have my-teams endpoint
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Filter teams where current user is captain or member
            // This would ideally be done on the backend with a proper my-teams endpoint
            setTeams(res.data);
        } catch (err) {
            console.error('Error fetching teams:', err.response?.data?.detail || err.message);
            // Don't redirect on error, just log it
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const fetchAllTeams = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllTeams(res.data);
        } catch (err) {
            console.error('Error fetching all teams:', err.response?.data?.detail || err.message);
        }
    }, [navigate]);

    const createTeam = useCallback(async (formData) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            navigate('/login');
            throw new Error('Authentication required');
        }
        
        try {
            console.log('Creating team with data:', formData);
            console.log('Using API URL:', `${process.env.REACT_APP_API_URL}/api/teams/`);
            
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            console.log('Team created successfully:', response.data);
            navigate('/teams');
            return response.data;
        } catch (err) {
            console.error('Failed to create team - Full error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Error headers:', err.response?.headers);
            
            // More specific error messages
            if (err.response?.status === 401) {
                console.error('Authentication failed - redirecting to login');
                localStorage.removeItem('access_token');
                navigate('/login');
                throw new Error('Authentication expired. Please log in again.');
            } else if (err.response?.status === 403) {
                throw new Error('You do not have permission to create teams.');
            } else if (err.response?.status === 422) {
                throw new Error('Invalid team data: ' + (err.response?.data?.detail || 'Please check your input'));
            } else if (!err.response) {
                throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
            }
            
            const errorMessage = err.response?.data?.detail || err.message || 'Unknown error occurred';
            throw new Error(errorMessage);
        }
    }, [navigate]);

    const sendInvite = useCallback(async (teamId, username) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/invitations`, 
                { username: username }, 
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('Invitation sent');
            await fetchTeams();
        } catch (err) {
            console.error('Failed to send invite:', err.response?.data?.detail || err.message);
            throw err; // Re-throw so calling component can handle it
        }
    }, [fetchTeams]);

    const respondToInvite = useCallback(async (teamId, accept) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/teams/${teamId}/invitations`,
                { status: accept ? 'accepted' : 'declined' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(accept ? 'Joined team' : 'Declined invitation');
            await fetchTeams();
        } catch (err) {
            console.error('Failed to respond to invite:', err.response?.data?.detail || err.message);
            throw err; // Re-throw so calling component can handle it
        }
    }, [fetchTeams]);

    const removeMember = useCallback(async (teamId, userId) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/members/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Member removed successfully');
            await fetchTeams();
        } catch (err) {
            console.error('Failed to remove member:', err.response?.data?.detail || err.message);
            throw err; // Re-throw so calling component can handle it
        }
    }, [fetchTeams]);

    const updateTeam = useCallback(async (teamId, teamData) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, teamData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Team updated successfully');
            await fetchTeams();
            return response.data;
        } catch (err) {
            console.error('Failed to update team:', err.response?.data?.detail || err.message);
            throw err; // Re-throw so calling component can handle it
        }
    }, [fetchTeams]);

    const deleteTeam = useCallback(async (teamId) => {
        const token = localStorage.getItem('access_token');
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Team deleted successfully');
                await fetchTeams();
            } catch (err) {
                console.error('Failed to delete team:', err.response?.data?.detail || err.message);
                throw err; // Re-throw so calling component can handle it
            }
        }
    }, [fetchTeams]);

    useEffect(() => {
        fetchTeams();
        fetchAllTeams(); // Fetch all teams on mount
    }, [fetchTeams, fetchAllTeams]);

    return { teams, allTeams, loading, fetchTeams, fetchAllTeams, createTeam, updateTeam, sendInvite, respondToInvite, removeMember, deleteTeam };
};

export default useTeamActions;