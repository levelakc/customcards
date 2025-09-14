import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as api from '../api/api';

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        logoUrl: '',
        backgroundVideoUrl: '',
        videoOpacity: 0.3,
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const data = await api.getSiteSettings();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch site settings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // NEW FUNCTION: Allows for instant "optimistic" UI updates.
    const updateLocalSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const value = { settings, loading, fetchSettings, updateLocalSettings };

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);