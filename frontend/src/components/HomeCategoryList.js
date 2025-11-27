import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';

export default function HomeCategoryList({ categories }) {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    return (
        <div className="bg-gray-800 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-white text-center mb-16">{t('ourCategoriesTitle')}</h2>
                {(!categories || categories.length === 0) ? (
                    <p className="text-center text-gray-400">No categories found. Please seed the database.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {categories.map(category => (
                                                            <div 
                                key={category._id} 
                                onClick={() => navigate('category', { id: category._id })}
                                className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition duration-300 ease-in-out"
                            >
                                <h2 className="text-2xl font-semibold text-white text-center mb-2">{category.name}</h2>
                            </div>                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
