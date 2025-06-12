// src/components/profile/GameAccounts.js
import React from 'react';

function GameAccounts({ gameAccounts, removeGameAccount }) {
    return (
        <div className="game-accounts">
            <h3>Game Accounts</h3>
            <ul>
                {gameAccounts.map((acc, index) => (
                    <li key={index}>
                        {acc.gameName}: {acc.accountId}
                        <button onClick={() => removeGameAccount(index)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GameAccounts;