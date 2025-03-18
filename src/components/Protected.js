import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Protected() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProtected = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('Please log in first');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/protected`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage(res.data.msg + ' - User ID: ' + res.data.userId);
            } catch (err) {
                setMessage(err.response.data.msg);
            }
        };
        fetchProtected();
    }, []);

    return (
        <div>
            <h2>Protected Page</h2>
            <p>{message}</p>
        </div>
    );
}

export default Protected;