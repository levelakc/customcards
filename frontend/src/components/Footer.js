import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    return (
        <footer className="bg-black text-white border-t border-gold-500/20 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                    <h3 className="text-2xl gold-gradient-text font-dancing mb-6">VIPCard</h3>
                    <p className="text-gray-500 max-w-xs mx-auto md:mx-0">{t('footerSlogan')}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-6 uppercase tracking-widest text-gold-500">{t('usefulLinks')}</h3>
                    <ul className="space-y-4">
                        <li><button onClick={() => navigate('accessibility')} className="text-gray-400 hover:text-gold-500 transition-colors">{t('accessibility')}</button></li>
                        <li><button onClick={() => navigate('policy')} className="text-gray-400 hover:text-gold-500 transition-colors">{t('policyTitle')}</button></li>
                        <li><button onClick={() => navigate('terms')} className="text-gray-400 hover:text-gold-500 transition-colors">{t('termsTitle')}</button></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-6 uppercase tracking-widest text-gold-500">{t('followUs')}</h3>
                    <div className="flex justify-center space-x-8 space-x-reverse">
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform">TikTok</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform">Instagram</a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform">Facebook</a>
                    </div>
                </div>
            </div>
            <div className="mt-16 border-t border-gray-900 pt-8 text-center">
                <p className="text-gray-600 text-sm tracking-widest">{t('copyright')}</p>
            </div>
        </footer>
    );
}