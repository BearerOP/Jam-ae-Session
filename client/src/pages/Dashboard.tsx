import { useEffect, useState } from "react";
import { getActiveSessions } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateSession from "../components/CreateSession";

interface Session {
    id: number;
    sessionName: string;
}

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const sessions = await getActiveSessions();
                console.log(sessions);
                
                setSessions(sessions);
            } catch (error) {
                console.error("Failed to fetch sessions:", error);
            }
        };

        fetchSessions();
    }, []);
    console.log(user);
    

    return (
        <>
            <div>
                <h1>Welcome {user?.username || "Guest"}</h1>
                <h2>Active Sessions:</h2>

                <ul>
                    {sessions?.map((session) => (
                        <li key={session.id} onClick={() => navigate(`/session/${session.id}`)}>
                            {session.sessionName}
                        </li>
                    ))}
                </ul>
            </div>
            <CreateSession />
        </>
    );
};

export default Home;
