import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function AccessibilityPage() {
    const { t } = useTranslation(); // Initialize useTranslation
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8 font-dancing">{t('accessibilityStatementTitle')}</h1>
                <div className="prose prose-invert text-gray-300">
                    <p>{t('accessibilityStatementP1')}</p>
                    <p>{t('accessibilityStatementP2')}</p>
                    <p>{t('accessibilityStatementP3')}</p>
                    <p>{t('accessibilityStatementP4')}</p>
                </div>
            </div>
        </div>
    );
}