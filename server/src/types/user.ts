export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    avatarUrl: string | null;
    role: string;
    createdAt: Date;
    hostedSessions?: Session[];
    sessions?: UserSession[];
    queueItems?: SessionQueue[];
};

export type Session = {
    id: number;
    sessionName: string;
    hostId: number;
    host?: User;
    startTime: Date;
    endTime: Date | null;
    isLive: boolean;
    participants?: UserSession[];
    queueItems?: SessionQueue[];
};

export type UserSession = {
    user?: User;
    userId: number;
    session?: Session;
    sessionId: number;
    joinedAt: Date;
};

export type SessionQueue = {
    id: number;
    session?: Session;
    sessionId: number;
    youtubeUrl: string;
    addedBy?: User;
    userId: number;
    position: number;
    addedAt: Date;
    isPlayed: boolean;
}; 

export interface SessionUser {
    id: string;
    username: string;
    ws: WebSocket;
}