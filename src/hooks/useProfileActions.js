// src/hooks/useProfileActions.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useProfileActions = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
        } catch (err) {
            alert(err.response?.data.msg || 'Error fetching profile');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const addGameAccount = useCallback(async (gameForm) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/user/profile/game-accounts`,
                gameForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser((prevUser) => ({ ...prevUser, gameAccounts: res.data }));
            return true; // Indicate success
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to add game account');
            return false;
        }
    }, []);

    const removeGameAccount = useCallback(async (gameName, accountId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/user/profile/game-accounts`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { gameName, accountId },
                }
            );
            setUser((prevUser) => ({ ...prevUser, gameAccounts: res.data }));
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to remove game account');
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { user, loading, fetchProfile, addGameAccount, removeGameAccount };
};

export default useProfileActions;