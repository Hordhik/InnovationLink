import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading] = useState(false);

    /**
     * Login function - stores token and user info
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} Login response
     */
    const login = async (_credentials) => {
        // Frontend no longer simulates auth; rely on backend
        return { success: true };
    };



    /**
     * Logout function - clears all auth data
     */
    const logout = () => {
        // Frontend-only context doesn’t hold auth anymore
        setUser(null);
    };

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    const isAuthenticated = () => {
        return !!user; // downstream code prefers JWT helpers in auth.js
    };

    /**
     * Get authentication token
     * @returns {string|null} Auth token
     */
    const getToken = () => null;

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        getToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;