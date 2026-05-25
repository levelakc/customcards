import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';
import { useTranslation } from 'react-i18next';

export default function AllCategoriesPage() {
    const { navigate } = useRouter();
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const allCategories = await api.getCategories();
                setCategories(allCategories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [i18n.language]);

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">{t('loadingCategories')}...</div>;

    const currentLanguage = i18n.language || 'he';

    const filteredCategories = categories.filter(category => {
        const name = category.name?.[currentLanguage] || category.name?.he || category.name?.en || category.name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-extrabold text-white font-dancing">{t('allCategoriesTitle')}</h1>
                    
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder={t('filterDesigns')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-gold-500 transition-colors"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(category => {
                            const categoryName = category.name?.[currentLanguage] || category.name?.he || category.name?.en || category.name || '';
                            return (
                                <div 
                                    key={category._id} 
                                    onClick={() => navigate('category', { id: category._id })}
                                    className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition duration-300 ease-in-out"
                                >
                                    <h2 className="text-2xl font-semibold text-white text-center mb-2">{categoryName}</h2>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            {t('noCategoriesOrProductsFound')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
