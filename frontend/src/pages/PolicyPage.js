import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PolicyPage() {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8 font-dancing">{t('policyTitle')}</h1>
                <div className="prose prose-invert text-gray-300 space-y-4">
                    <p>{t('policyIntro')}</p>
                    <p><strong>{t('cancellationPolicyTitle')}</strong> {t('cancellationPolicy')}</p>
                    <p><strong>{t('warrantyTitle')}</strong> {t('warranty')}</p>
                    <p><strong>{t('securityTitle')}</strong> {t('security')}</p>
                </div>
            </div>
        </div>
    );
}
