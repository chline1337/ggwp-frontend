// src/hooks/useProfileActions.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const useProfileActions = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err.response?.data?.detail || err.message);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const addGameAccount = useCallback(async (gameForm) => {
        const token = localStorage.getItem('access_token');
        try {
            // Convert camelCase to snake_case for backend
            const backendFormat = {
                game_name: gameForm.gameName,
                account_id: gameForm.accountId
            };
            const res = await axios.post(
                `${API_BASE_URL}/api/users/me/game-accounts`,
                backendFormat,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
            return true;
        } catch (err) {
            console.error('Failed to add game account:', err.response?.data?.detail || err.message);
            return false;
        }
    }, []);

    const removeGameAccount = useCallback(async (accountIndex) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.delete(
                `${API_BASE_URL}/api/users/me/game-accounts/${accountIndex}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUser(res.data);
        } catch (err) {
            console.error('Failed to remove game account:', err.response?.data?.detail || err.message);
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/users/me`,
                profileData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
        } catch (err) {
            console.error('Failed to update profile:', err.response?.data?.detail || err.message);
        }
    }, []);

    const uploadAvatar = useCallback(async (file) => {
        // Avatar upload functionality not yet implemented in backend
        console.log('Avatar upload feature is not yet available. Please check back later.');
        return;
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { user, loading, fetchProfile, addGameAccount, removeGameAccount, updateProfile, uploadAvatar };
};

export default useProfileActions;