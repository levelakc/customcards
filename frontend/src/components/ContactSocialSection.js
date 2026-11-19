import React from 'react';
import { useTranslation } from 'react-i18next';
import { contactConfig, getWhatsAppUrl } from '../config/contactConfig';

export const InstagramIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

export const FacebookIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
    </svg>
);

export const TikTokIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

export const WhatsAppIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.433-9.894-9.896-9.894-5.459 0-9.885 4.434-9.888 9.894-.001 2.225.651 4.318 1.841 6.033l-1.225 4.485 4.574-1.21z" />
    </svg>
);

export const PhoneIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

export default function ContactSocialSection() {
    const { t } = useTranslation();
    const whatsappUrl = getWhatsAppUrl();

    const socialLinks = [
        {
            name: 'Instagram',
            href: contactConfig.social.instagram,
            icon: <InstagramIcon className="w-7 h-7" />,
            subtitle: t('instagramHandle') || 'עקבו אחרינו באינסטגרם',
        },
        {
            name: 'Facebook',
            href: contactConfig.social.facebook,
            icon: <FacebookIcon className="w-7 h-7" />,
            subtitle: t('facebookHandle') || 'הצטרפו לעמוד הפייסבוק',
        },
        {
            name: 'TikTok',
            href: contactConfig.social.tiktok,
            icon: <TikTokIcon className="w-7 h-7" />,
            subtitle: t('tiktokHandle') || 'צפו בסרטונים שלנו בטיקטוק',
        },
    ];

    return (
        <section className="bg-[#181818] border-t border-gold-500/20 py-20 text-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-14">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-gold-400 mb-3">
                        VIPCard
                    </span>
                    <h2 className="text-4xl md:text-5xl text-white mb-4">
                        {t('contactAndSocialTitle') || 'צרו איתנו קשר ועקבו אחרינו'}
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        {t('contactAndSocialSubtitle') || 'יש לכם שאלה, בקשה לעיצוב מיוחד או רוצים לראות עוד יצירות שלנו? אנחנו זמינים עבורכם תמיד.'}
                    </p>
                </div>

                {/* Direct Contact Row: WhatsApp & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="luxury-card-surface rounded-2xl p-6 sm:p-8 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_24px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
                            <WhatsAppIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-1">
                                WhatsApp
                            </p>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-gold-300 transition-colors">
                                {t('contactWhatsAppTitle') || 'שלחו לנו הודעה בוואטסאפ'}
                            </h3>
                            <p className="text-gray-300 text-base font-medium" dir="ltr">
                                {contactConfig.phoneDisplay}
                            </p>
                        </div>
                        <span className="btn-premium btn-gold text-xs px-4 py-2 hidden sm:inline-flex">
                            {t('messageUsButton') || 'שלח הודעה'}
                        </span>
                    </a>

                    <a
                        href={contactConfig.phoneHref}
                        className="luxury-card-surface rounded-2xl p-6 sm:p-8 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-black border border-gold-500/50 text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-black transition-all duration-300">
                            <PhoneIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-1">
                                {t('phoneLabel') || 'טלפון'}
                            </p>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-gold-300 transition-colors">
                                {t('contactPhoneTitle') || 'דברו איתנו בטלפון'}
                            </h3>
                            <p className="text-gray-300 text-base font-medium" dir="ltr">
                                {contactConfig.phoneDisplay}
                            </p>
                        </div>
                        <span className="btn-premium btn-obsidian text-xs px-4 py-2 hidden sm:inline-flex">
                            {t('callUsButton') || 'חייג עכשיו'}
                        </span>
                    </a>
                </div>

                {/* Social Media Row: Instagram, Facebook, TikTok */}
                <div className="pt-6 border-t border-gold-500/15">
                    <h3 className="text-center text-xl font-bold text-gold-300 mb-6 tracking-wide">
                        {t('followUsOnSocial') || 'עקבו אחרינו ברשתות החברתיות'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="luxury-card-surface rounded-2xl px-6 py-5 flex items-center justify-center sm:justify-start gap-4 transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-black/60 border border-gold-500/40 text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-black group-hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300">
                                    {social.icon}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
                                        {social.name}
                                    </div>
                                    <div className="text-xs text-gray-300">
                                        {social.subtitle}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
