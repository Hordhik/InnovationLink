import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session/token
        const checkAuthStatus = () => {
            try {
                const token = localStorage.getItem('auth_token');
                const userInfo = localStorage.getItem('user_info');
                
                if (token && userInfo) {
                    // Parse stored user info
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                // Clear invalid data
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    /**
     * Login function - stores token and user info
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} Login response
     */
    const login = async (credentials) => {
        try {
            setLoading(true);
            
            // Create user data from credentials
            const userData = {
                id: Date.now().toString(), // Generate a simple ID
                email: credentials.email,
                name: credentials.email.split('@')[0], // Use email prefix as name
                role: 'user'
            };
            
            // Store auth data
            localStorage.setItem('auth_token', 'auth-token-' + Date.now());
            localStorage.setItem('user_info', JSON.stringify(userData));

            // Update state
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };



    /**
     * Logout function - clears all auth data
     */
    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        setUser(null);
    };

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('auth_token');
    };

    /**
     * Get authentication token
     * @returns {string|null} Auth token
     */
    const getToken = () => {
        return localStorage.getItem('auth_token');
    };

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