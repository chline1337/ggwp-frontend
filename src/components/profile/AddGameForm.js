// src/components/profile/AddGameForm.js
import React, { useState } from 'react';

function AddGameForm({ addGameAccount }) {
    const [gameForm, setGameForm] = useState({ gameName: '', accountId: '' });

    const handleGameChange = (e) => {
        setGameForm({ ...gameForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await addGameAccount(gameForm);
        if (success) setGameForm({ gameName: '', accountId: '' });
    };

    return (
        <form className="add-game-form" onSubmit={handleSubmit}>
            <div className="form-input-group">
                <input
                    type="text"
                    name="gameName"
                    placeholder="Game Name"
                    value={gameForm.gameName}
                    onChange={handleGameChange}
                    required
                />
            </div>
            <div className="form-input-group">
                <input
                    type="text"
                    name="accountId"
                    placeholder="Account ID"
                    value={gameForm.accountId}
                    onChange={handleGameChange}
                    required
                />
            </div>
            <button type="submit">Add Game Account</button>
        </form>
    );
}

export default AddGameForm;