import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import Session from "./pages/Session";

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SessionProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/session/:sessionId" element={<Session />} />
                    </Routes>
                </Router>
            </SessionProvider>
        </AuthProvider>
    );
};

export default App;
