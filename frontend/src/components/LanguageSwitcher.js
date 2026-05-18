import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center bg-gray-800 bg-opacity-50 rounded-full p-1 border border-gray-700">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${i18n.language === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('he')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${i18n.language === 'he' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                HE
            </button>
        </div>
    );
}
