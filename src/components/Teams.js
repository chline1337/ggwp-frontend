import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Teams.css';

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
            const payload = { teamId: e.target.elements.teamId.value, username: inviteForm.username };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/team/invite`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Invitation sent');
            setInviteForm({ teamId: '', username: '' });
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

    const deleteTeam = async (teamId) => {
        const token = localStorage.getItem('token');
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/team/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Team deleted successfully');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/team/my-teams`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeams(res.data);
            } catch (err) {
                alert(err.response.data.msg);
            }
        }
    };

    const currentUserId = localStorage.getItem('userId');

    return (
        <div className="teams-container">
            <button className="create-team-btn" onClick={() => navigate('/team-create')}>Create New Team</button>
            {teams.map((team) => (
                <div key={team._id} className="team-card">
                    <h3>{team.name}</h3>
                    <p>{team.description}</p>
                    <p>Captain: {team.captain.username}</p>
                    <div className="team-members">
                        <h4>Members</h4>
                        <ul>
                            {team.members.map((member, index) => (
                                <li key={index}>{member.user.username} ({member.role})</li>
                            ))}
                        </ul>
                    </div>
                    {team.captain._id.toString() === currentUserId && (
                        <>
                            <form className="invite-form" onSubmit={sendInvite}>
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
                            <button onClick={() => deleteTeam(team._id)}>Delete Team</button>
                        </>
                    )}
                    <div className="team-invitations">
                        <h4>Pending Invitations</h4>
                        <ul>
                            {team.invitations.map((inv, index) => (
                                <li key={index}>
                                    {inv.user.username}
                                    {inv.user._id.toString() === currentUserId && (
                                        <>
                                            <button onClick={() => respondToInvite(team._id, true)}>Accept</button>
                                            <button onClick={() => respondToInvite(team._id, false)}>Decline</button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Teams;