import React, { useState, createContext, useContext, useEffect } from 'react';
import * as api from '../api/api'; 

export const AuthContext = createContext(null);

const userInfoFromStorage = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(userInfoFromStorage);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // Once the component mounts and user state is initialized, set loading to false
        setLoading(false);
    }, []);
    
    
    const login = async (email, password) => {
        try {
            const data = await api.loginUser(email, password);
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    
    const register = async (registrationData) => {
        try {
            const data = await api.registerUser(registrationData);
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    // New function to update user state from anywhere in the app
    const updateUserState = (newUserData) => {
        setUser(newUserData);
    };

    const value = {
        user,
        token: user?.token, 
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin,
        login,
        register,
        logout,
        updateUserState,
        loading, // Expose loading state
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);