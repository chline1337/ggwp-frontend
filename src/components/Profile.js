import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState(null);
    const [gameForm, setGameForm] = useState({ gameName: '', accountId: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
            } catch (err) {
                alert(err.response.data.msg);
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleGameChange = (e) => {
        setGameForm({ ...gameForm, [e.target.name]: e.target.value });
    };

    const addGameAccount = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/user/profile/game-accounts`,
                gameForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser({ ...user, gameAccounts: res.data });
            setGameForm({ gameName: '', accountId: '' });
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const removeGameAccount = async (gameName, accountId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/user/profile/game-accounts`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { gameName, accountId },
                }
            );
            setUser({ ...user, gameAccounts: res.data });
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>Profile</h2>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <h3>Game Accounts</h3>
            <ul>
                {user.gameAccounts.map((acc, index) => (
                    <li key={index}>
                        {acc.gameName}: {acc.accountId}{' '}
                        <button onClick={() => removeGameAccount(acc.gameName, acc.accountId)}>Remove</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={addGameAccount}>
                <input
                    type="text"
                    name="gameName"
                    placeholder="Game Name"
                    value={gameForm.gameName}
                    onChange={handleGameChange}
                    required
                />
                <input
                    type="text"
                    name="accountId"
                    placeholder="Account ID"
                    value={gameForm.accountId}
                    onChange={handleGameChange}
                    required
                />
                <button type="submit">Add Game Account</button>
            </form>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</button>
            <button onClick={() => navigate('/teams')}>My Teams</button>

        </div>
    );
}

export default Profile;