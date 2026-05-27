import React from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import * as api from '../api/api';

const LoadingScreen = () => {
    const { settings } = useSiteSettings();
    
    // Construct the full logo URL
    let finalLogoUrl = settings.logoUrl;
    if (finalLogoUrl && finalLogoUrl.startsWith('/uploads')) {
        finalLogoUrl = `${api.BASE_URL}${finalLogoUrl}`;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center">
                {finalLogoUrl ? (
                    <img 
                        src={finalLogoUrl} 
                        alt="Logo" 
                        className="h-32 w-auto object-contain animate-pulse" 
                    />
                ) : (
                    <div className="w-32 h-32 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <div className="mt-8">
                    <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gold-500 animate-loading-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
