import axios from "axios";
import { Session, User } from "../types/user";

const API_URL = "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
    baseURL: API_URL
});

// Add request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Login API
export const loginUser = async (email: string, password: string) => {
    const { data } = await api.post("/user/login", { email, password });
    return data;
};

// Signup API
export const registerUser = async (username: string, email: string, password: string) => {
    await api.post("/user/signup", { username, email, password });
};

// Fetch user profile API
export const getUserProfile = async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>("/user/me");
    return data.data;
};



// Get active sessions API
export const getActiveSessions = async (): Promise<Session[]> => {
    const { data } = await api.get<{ data: Session[] }>("/session/active");    
    return data;
};

// Create session API
export const createSessionApi = async (name: string) => {
    const { data } = await api.post("/session/create", { sessionName: name });
    return data;
};

// Add video to queue API
export const addVideoToQueue = async (sessionId: number, url: string) => {
    const { data } = await api.post(`/session/${sessionId}/queue`, { youtubeUrl: url });
    return data;
};


export const getQueue = async (sessionId: string) => {
    const data  = await api.get(`/session/${sessionId}/queue`);
    return data;
}
