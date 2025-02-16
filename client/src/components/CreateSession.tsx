import React, { useState } from "react";
import { useSession } from "../context/SessionContext";

const CreateSession: React.FC = () => {
    const { createSession } = useSession();
    const [sessionName, setSessionName] = useState("");

    return (
        <div>
            <input
                type="text"
                placeholder="Session Name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
            />
            <button onClick={() => createSession(sessionName)}>Create</button>
        </div>
    );
};

export default CreateSession;
