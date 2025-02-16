import React, { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { createSessionApi } from "../utils/api";

const API_URL = "http://localhost:8080/api/session";

interface Session {
    id: number;
    sessionName: string;
    isLive: boolean;
    hostId: number;
}

interface SessionContextType {
    sessions: Session[];
    createSession: (name: string) => Promise<void>;
    joinSession: (sessionId: number) => Promise<void>;
    activeSession: Session | null;
    endSession: (sessionId: number) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);

    useEffect(() => {
        // Fetch active sessions on mount
        axios.get(`${API_URL}/active`)
            .then((res) => setSessions(res.data))
            .catch((error) => console.error("Failed to fetch sessions:", error));

        // WebSocket Handling
        const socket = new WebSocket("ws://localhost:8080");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === "sessionCreated") {
                setSessions((prev) => [...prev, data.data]);
            } else if (data.event === "sessionEnded") {
                setSessions((prev) => prev.filter((session) => session.id !== data.data.sessionId));
                if (activeSession?.id === data.data.sessionId) {
                    setActiveSession(null);
                }
            }
        };

        return () => {
            socket.close();
        };
    }, []); // Empty dependency array ensures it runs only once

    const createSession = async (name: string) => {
        try {
            const res: AxiosResponse = await createSessionApi(name);
            return res.data;
        } catch (error) {
            console.error("Error creating session:", error);
            throw error;
        }
    };

    const joinSession = async (sessionId: number) => {
        try {
            await axios.post(`${API_URL}/join/${sessionId}`);
            const session = sessions.find((s) => s.id === sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            setActiveSession(session);
        } catch (error) {
            console.error("Failed to join session:", error);
            throw error;
        }
    };

    const endSession = async (sessionId: number) => {
        try {
            await axios.post(`${API_URL}/end/${sessionId}`);
            // Send WebSocket event
            const socket = new WebSocket("ws://localhost:8080");
            socket.onopen = () => {
                socket.send(JSON.stringify({ event: "sessionEnded", sessionId }));
            };
        } catch (error) {
            console.error("Failed to end session:", error);
            throw error;
        }
    };

    return (
        <SessionContext.Provider value={{ sessions, createSession, joinSession, activeSession, endSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};
