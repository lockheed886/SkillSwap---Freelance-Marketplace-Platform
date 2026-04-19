// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// 1. Create Context
const AuthContext = createContext(null);

// 2. Create Provider Component
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: true, // Start loading until we check localStorage
        error: null,
    });
    const navigate = useNavigate(); // Hook for navigation

    // Check local storage on initial load
    useEffect(() => {
        const storedUserData = authService.getCurrentUser();
        if (storedUserData && storedUserData.token) {
            setAuthState({
                token: storedUserData.token,
                user: { // Store only necessary user info from login response
                    _id: storedUserData._id,
                    name: storedUserData.name,
                    email: storedUserData.email,
                    role: storedUserData.role,
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            // Optionally set default axios header here if needed globally
            // axios.defaults.headers.common['Authorization'] = `Bearer ${storedUserData.token}`;
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []); // Empty dependency array runs only once on mount

    // Login Action
    const login = async (credentials) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await authService.login(credentials);
            setAuthState({
                token: data.token,
                user: { _id: data._id, name: data.name, email: data.email, role: data.role },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            // Optionally set default axios header
             // axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            // Redirect based on role after successful login
            switch (data.role) {
                case 'client':
                    navigate('/client/dashboard'); // Example client route
                    break;
                case 'freelancer':
                    navigate('/freelancer/dashboard'); // Example freelancer route
                    break;
                case 'admin':
                     navigate('/admin/dashboard'); // Example admin route
                     break;
                default:
                    navigate('/'); // Default redirect
            }
            return data; // Return data for potential use in component
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
            throw error; // Re-throw error to be caught in component
        }
    };

    // Signup Action (optional in context, could be handled directly in page)
    const signup = async (userData) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
             // Signup service doesn't return token, just user info/message
            const data = await authService.signup(userData);
            setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
             // Don't log in automatically, navigate to login or verification page
            navigate('/login'); // Redirect to login after successful signup
            alert('Signup successful! Please log in.'); // Or show a proper notification
            return data;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
            throw error;
        }
    };


    // Logout Action
    const logout = () => {
        authService.logout();
        // Clear axios header if set
        // delete axios.defaults.headers.common['Authorization'];
        setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
        navigate('/login'); // Redirect to login page after logout
    };

    // Value provided to consuming components
    const value = {
        ...authState, // token, user, isAuthenticated, isLoading, error
        login,
        logout,
        signup, // Provide signup if handled here
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom Hook to use the Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};