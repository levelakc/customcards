import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i18n.language === 'en' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                EN
            </button>
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <button
                onClick={() => changeLanguage('he')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i18n.language === 'he' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                HE
            </button>
        </div>
    );
}
