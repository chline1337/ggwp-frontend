// src/components/tournament/SignupForm.js
import React, { useState } from 'react';
import axios from 'axios';

function SignupForm({ tournament, refreshTournament }) {
    const [signupForm, setSignupForm] = useState({ teamId: '' });

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const signup = async (isTeam) => {
        const token = localStorage.getItem('token');
        try {
            const payload = isTeam ? { tournamentId: tournament._id, teamId: signupForm.teamId } : { tournamentId: tournament._id };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Signed up successfully');
            refreshTournament();
        } catch (err) {
            alert(err.response?.data.msg || 'Signup failed');
        }
    };

    return tournament.participantType === 'user' ? (
        <button onClick={() => signup(false)}>Sign Up</button>
    ) : (
        <form className="signup-form" onSubmit={(e) => { e.preventDefault(); signup(true); }}>
            <input
                type="text"
                name="teamId"
                placeholder="Team ID"
                value={signupForm.teamId}
                onChange={handleSignupChange}
            />
            <button type="submit">Sign Up Team</button>
        </form>
    );
}

export default SignupForm;