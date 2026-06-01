import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function AboutUs() {
    const { t } = useTranslation(); // Initialize useTranslation
    return (
        <div className="bg-gray-900 py-20 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold mb-8">{t('howItWorksTitle')}</h2>
                <div className="grid md:grid-cols-3 gap-8 text-lg">
                    <div className="flex flex-col items-center">
                        <div className="glass-panel w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 border-gold-500/50 gold-gradient-text">1</div>
                        <h3 className="font-bold mb-2">{t('placeAnOrderTitle')}</h3>
                        <p className="text-gray-400">{t('placeAnOrderDescription')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="glass-panel w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 border-gold-500/50 gold-gradient-text">2</div>
                        <h3 className="font-bold mb-2">{t('weContactYouTitle')}</h3>
                        <p className="text-gray-400">{t('weContactYouDescription')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="glass-panel w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 border-gold-500/50 gold-gradient-text">3</div>
                        <h3 className="font-bold mb-2">{t('homeDeliveryTitle')}</h3>
                        <p className="text-gray-400">{t('homeDeliveryDescription')}</p>
                    </div>
                </div>

                {/* New Security Section */}
                <div className="mt-12 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-green-500 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <p className="text-gray-300 text-xl">
                        {t('securityMessageStart')} <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Stripe.com</a> {t('securityMessageAnd')} <a href="https://www.bit.co.il/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Bit</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}