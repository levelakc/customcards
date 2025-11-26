import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center w-20">
            <button
                onClick={() => changeLanguage('en')}
                className={`me-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${i18n.language === 'en' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                EN
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
                onClick={() => changeLanguage('he')}
                className={`ms-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${i18n.language === 'he' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                HE
            </button>
        </div>
    );
}
