import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserProfile } from "../utils/api";

interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            getUserProfile()
                .then((user) => setUser(user))
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                });
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { token, message } = await loginUser(email, password);

            localStorage.setItem("token", token);
            console.log(message);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        try {
            await registerUser(username, email, password);
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
