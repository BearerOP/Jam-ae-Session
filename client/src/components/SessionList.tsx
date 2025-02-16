import React from "react";
import { useSession } from "../context/SessionContext";

const SessionList: React.FC = () => {
    const { sessions, joinSession } = useSession();

    return (
        <div>
            <h2>Available Sessions</h2>
            {sessions.map(session => (
                <div key={session.id}>
                    <h3>{session.sessionName}</h3>
                    <button onClick={() => joinSession(session.id)}>Join</button>
                </div>
            ))}
        </div>
    );
};

export default SessionList;
