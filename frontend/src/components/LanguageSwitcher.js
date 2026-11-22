import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const isEn = i18n.language?.startsWith('en');
    const isHe = !isEn;

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center bg-gray-800 rounded-full p-1 border border-gold-500/30">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${isEn ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:text-white'}`}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('he')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${isHe ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:text-white'}`}
            >
                HE
            </button>
        </div>
    );
}
