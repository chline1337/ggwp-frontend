// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data);
            } catch (err) {
                alert(err.response?.data.msg || 'Error fetching users');
            }
        };
        fetchUsers();
    }, [navigate]);

    return users;
};

export default useUsers;