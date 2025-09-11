import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as api from '../api/api';

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        logoUrl: 'https://placehold.co/120x40/4A5568/FFFFFF?text=VIPCard',
        backgroundVideoUrl: '',
        videoOpacity: 0.3,
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const data = await api.getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch site settings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const value = { settings, loading, fetchSettings };

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);