import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-800 text-white text-center p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-bold text-lg mb-4">VIPCard</h3>
                    <p className="text-gray-400">{t('footerSlogan')}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4">{t('usefulLinks')}</h3>
                    <ul className="space-y-2">
                        <li><button onClick={() => navigate('accessibility')} className="text-gray-400 hover:text-white">{t('accessibility')}</button></li>
                        <li><button onClick={() => navigate('policy')} className="text-gray-400 hover:text-white">{t('policyTitle')}</button></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4">{t('followUs')}</h3>
                    <div className="flex justify-center space-x-6 space-x-reverse">
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">TikTok</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Instagram</a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Facebook</a>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-4">
                <p className="text-gray-500">{t('copyright')}</p>
            </div>
        </footer>
    );
}