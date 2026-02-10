import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 1. Load User on Startup ---
    useEffect(() => {
        const savedUser = localStorage.getItem('employer');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // After loading, immediately check if they are still allowed in
            verifyStatusWithServer(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    // --- 2. Live Security Check (Fulfills Accuracy Requirement) ---
    const verifyStatusWithServer = async (userId) => {
        try {
            // We call a simple endpoint to get the LATEST status from SQL
            const res = await fetch(`https://localhost:7149/api/Employer/status/${userId}`);
            if (res.ok) {
                const latestStatus = await res.json(); // returns 'Verified', 'Blocked', etc.
                
                // If the Admin blocked them while they were logged in, logout immediately
                if (latestStatus === 'Blocked') {
                    logout();
                    alert("Your account has been suspended by the Admin.");
                } else {
                    // Update the local state with the real status from SQL
                    const updatedUser = { ...user, verificationStatus: latestStatus };
                    setUser(updatedUser);
                    localStorage.setItem('employer', JSON.stringify(updatedUser));
                }
            }
        } catch (err) {
            console.error("Security sync failed.");
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('employer', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('employer');
        window.location.href = '/login'; // Force redirect to login
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);