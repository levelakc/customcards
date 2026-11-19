import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function AboutUs() {
    const { t } = useTranslation(); // Initialize useTranslation
    return (
        <div className="bg-[#151412] py-20 text-white border-t border-gold-500/15">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold gold-gradient-text mb-12">{t('howItWorksTitle')}</h2>
                <div className="grid md:grid-cols-3 gap-8 text-lg">
                    <div className="luxury-card-surface rounded-2xl p-8 flex flex-col items-center">
                        <div className="btn-premium btn-gold w-16 h-16 rounded-full text-2xl font-bold mb-6 cursor-default">
                            <span>1</span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">{t('placeAnOrderTitle')}</h3>
                        <p className="text-gray-300 leading-relaxed">{t('placeAnOrderDescription')}</p>
                    </div>
                    <div className="luxury-card-surface rounded-2xl p-8 flex flex-col items-center">
                        <div className="btn-premium btn-gold w-16 h-16 rounded-full text-2xl font-bold mb-6 cursor-default">
                            <span>2</span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">{t('weContactYouTitle')}</h3>
                        <p className="text-gray-300 leading-relaxed">{t('weContactYouDescription')}</p>
                    </div>
                    <div className="luxury-card-surface rounded-2xl p-8 flex flex-col items-center">
                        <div className="btn-premium btn-gold w-16 h-16 rounded-full text-2xl font-bold mb-6 cursor-default">
                            <span>3</span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">{t('homeDeliveryTitle')}</h3>
                        <p className="text-gray-300 leading-relaxed">{t('homeDeliveryDescription')}</p>
                    </div>
                </div>

                {/* Security Section */}
                <div className="mt-14 glass-panel p-6 max-w-2xl mx-auto flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-11 h-11 text-gold-400 mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <p className="text-gray-200 text-lg">
                        {t('securityMessageStart')} <a href="https://www.payplus.co.il/" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 font-semibold hover:underline">PayPlus</a> {t('securityMessageAnd')} <a href="https://www.bit.co.il/" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 font-semibold hover:underline">Bit</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}