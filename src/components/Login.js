import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Form.css';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
            const token = res.data.token;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            localStorage.setItem('userId', decoded.userId);
            alert(res.data.msg);
            navigate('/profile');
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    return (
        <div className="form-container">
            <form className="form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-buttons">
                    <button type="submit">Login</button>
                    <button type="button" className="signup" onClick={handleSignup}>Sign Up</button>
                </div>
            </form>
        </div>
    );
}

export default Login;