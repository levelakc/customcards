import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8 font-dancing">{t('termsTitle')}</h1>
                <div className="prose prose-invert text-gray-300 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-3">{t('termsIntroTitle')}</h2>
                        <p>{t('termsIntro')}</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold mb-3">{t('termsUserConductTitle')}</h2>
                        <p>{t('termsUserConduct')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">{t('termsIPTitle')}</h2>
                        <p>{t('termsIP')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">{t('termsLimitationTitle')}</h2>
                        <p>{t('termsLimitation')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">{t('termsPrivacyTitle')}</h2>
                        <p>{t('termsPrivacy')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
