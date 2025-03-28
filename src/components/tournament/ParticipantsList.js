// src/components/tournament/ParticipantsList.js
import React from 'react';

function ParticipantsList({ participants }) {
    return (
        <div className="participants-list">
            <h4>Participants</h4>
            <ul>
                {participants.map((p, index) => (
                    <li key={index}>{p ? (p.username || p.name) : 'TBD'}</li>
                ))}
            </ul>
        </div>
    );
}

export default ParticipantsList;