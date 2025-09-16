import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center space-x-2">
            <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-gray-700' : ''}`}>
                <span role="img" aria-label="English">🇬🇧</span>
            </button>
            <button onClick={() => changeLanguage('he')} className={`px-2 py-1 rounded ${i18n.language === 'he' ? 'bg-gray-700' : ''}`}>
                <span role="img" aria-label="Hebrew">🇮🇱</span>
            </button>
        </div>
    );
}
