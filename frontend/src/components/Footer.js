import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';
import { contactConfig, getWhatsAppUrl } from '../config/contactConfig';
import { InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon, PhoneIcon } from './ContactSocialSection';

export default function Footer() {
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const whatsappUrl = getWhatsAppUrl();

    return (
        <footer className="bg-black text-white border-t border-gold-500/30 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <h3 className="text-3xl gold-gradient-text font-luxury mb-5">VIPCard</h3>
                    <p className="text-gray-300 max-w-xs leading-relaxed">{t('footerSlogan')}</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-5 uppercase tracking-wider text-gold-400">{t('usefulLinks')}</h3>
                    <ul className="space-y-3">
                        <li><button onClick={() => navigate('accessibility')} className="text-gray-300 hover:text-gold-400 transition-colors">{t('accessibility')}</button></li>
                        <li><button onClick={() => navigate('policy')} className="text-gray-300 hover:text-gold-400 transition-colors">{t('policyTitle')}</button></li>
                        <li><button onClick={() => navigate('terms')} className="text-gray-300 hover:text-gold-400 transition-colors">{t('termsTitle')}</button></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-5 uppercase tracking-wider text-gold-400">{t('contactUsTitle') || 'צור קשר'}</h3>
                    <div className="space-y-3">
                        <a
                            href={contactConfig.phoneHref}
                            className="flex items-center gap-3 text-gray-200 hover:text-gold-400 transition-colors group"
                        >
                            <span className="w-9 h-9 rounded-lg bg-gray-800 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-black transition-all">
                                <PhoneIcon className="w-4 h-4" />
                            </span>
                            <span dir="ltr" className="font-medium">{contactConfig.phoneDisplay}</span>
                        </a>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-200 hover:text-emerald-400 transition-colors group"
                        >
                            <span className="w-9 h-9 rounded-lg bg-gray-800 border border-gold-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <WhatsAppIcon className="w-4 h-4" />
                            </span>
                            <span className="font-medium">WhatsApp</span>
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-5 uppercase tracking-wider text-gold-400">{t('followUs')}</h3>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={contactConfig.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            title="Instagram"
                            className="w-11 h-11 rounded-xl bg-gray-800 border border-gold-500/30 text-gold-300 hover:bg-gold-500 hover:text-black hover:shadow-[0_0_16px_rgba(212,175,55,0.45)] flex items-center justify-center transition-all duration-300"
                        >
                            <InstagramIcon className="w-5 h-5" />
                        </a>
                        <a
                            href={contactConfig.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            title="Facebook"
                            className="w-11 h-11 rounded-xl bg-gray-800 border border-gold-500/30 text-gold-300 hover:bg-gold-500 hover:text-black hover:shadow-[0_0_16px_rgba(212,175,55,0.45)] flex items-center justify-center transition-all duration-300"
                        >
                            <FacebookIcon className="w-5 h-5" />
                        </a>
                        <a
                            href={contactConfig.social.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                            title="TikTok"
                            className="w-11 h-11 rounded-xl bg-gray-800 border border-gold-500/30 text-gold-300 hover:bg-gold-500 hover:text-black hover:shadow-[0_0_16px_rgba(212,175,55,0.45)] flex items-center justify-center transition-all duration-300"
                        >
                            <TikTokIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="mt-14 border-t border-gold-500/15 pt-8 text-center">
                <p className="text-gray-400 text-sm tracking-widest">{t('copyright')}</p>
            </div>
        </footer>
    );
}