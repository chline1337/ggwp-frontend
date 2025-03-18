import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Teams() {
    const [teams, setTeams] = useState([]);
    const [inviteForm, setInviteForm] = useState({ teamId: '', username: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeams = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team/my-teams`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeams(res.data);
            } catch (err) {
                alert(err.response.data.msg);
                navigate('/login');
            }
        };
        fetchTeams();
    }, [navigate]);

    const handleInviteChange = (e) => {
        setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
    };

    const sendInvite = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/team/invite`, inviteForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Invitation sent');
            setInviteForm({ teamId: '', username: '' });
            // Refresh teams
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team/my-teams`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTeams(res.data);
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const respondToInvite = async (teamId, accept) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/team/respond-invitation`,
                { teamId, accept },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(accept ? 'Joined team' : 'Declined invitation');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team/my-teams`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTeams(res.data);
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    return (
        <div>
            <h2>My Teams</h2>
            <button onClick={() => navigate('/team-create')}>Create New Team</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
            {teams.map((team) => (
                <div key={team._id}>
                    <h3>{team.name}</h3>
                    <p>{team.description}</p>
                    <p>Captain: {team.captain.username}</p>
                    <h4>Members</h4>
                    <ul>
                        {team.members.map((member, index) => (
                            <li key={index}>{member.user.username} ({member.role})</li>
                        ))}
                    </ul>
                    {team.captain._id === localStorage.getItem('userId') && (
                        <form onSubmit={sendInvite}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Invite Username"
                                value={inviteForm.username}
                                onChange={handleInviteChange}
                            />
                            <input type="hidden" name="teamId" value={team._id} />
                            <button type="submit">Invite</button>
                        </form>
                    )}
                    <h4>Pending Invitations</h4>
                    <ul>
                        {team.invitations.map((inv, index) => (
                            <li key={index}>
                                {inv.user.username}{' '}
                                <button onClick={() => respondToInvite(team._id, true)}>Accept</button>
                                <button onClick={() => respondToInvite(team._id, false)}>Decline</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default Teams;