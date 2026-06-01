import React, { useState, useMemo } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import ProductCard from './ProductCard'; // Assuming ProductCard is in the same directory or accessible
import { nameToKeyMap } from '../utils/colorUtils'; // Import color utility functions

export default function CategoryProductGallery() {
    const { navigate } = useRouter();
    const { t, i18n } = useTranslation();
    const { products: allProducts, categories: allCategories, isGlobalLoading } = useData();
    const [colorIndexes] = useState({}); // State to manage color indexes for each product

    const currentLanguage = i18n.language || 'he';

    const categoriesWithRandomProduct = useMemo(() => {
        if (!allCategories.length || !allProducts.length) return [];

        return allCategories.map(category => {
            const productsInCategory = allProducts.filter(p => String(p.category?._id) === String(category._id));
            if (productsInCategory.length > 0) {
                const randomIndex = Math.floor(Math.random() * productsInCategory.length);
                return { category, product: productsInCategory[randomIndex] };
            }
            return { category, product: null };
        }).filter(item => item.product !== null);
    }, [allCategories, allProducts]);

    if (isGlobalLoading) {
        return <div className="text-center text-white py-10">{t('loadingCategoriesAndProducts')}</div>;
    }

    if (categoriesWithRandomProduct.length === 0) {
        return <div className="text-center text-gray-400 py-10">{t('noCategoriesOrProductsFound')}</div>;
    }

    return (
        <div className="bg-gray-800 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 
                    className="text-3xl font-extrabold text-white text-center mb-16 cursor-pointer"
                    onClick={() => navigate('all-categories')} 
                >
                                                {t('allCategoriesTitle')}                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categoriesWithRandomProduct.map(({ category, product }) => {
                        const categoryName = category.name?.[currentLanguage] || category.name?.he || category.name?.en || category.name || '';
                        return (
                            <div key={category._id} className="glass-panel overflow-hidden flex flex-col cursor-pointer transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]" onClick={() => navigate('category', { id: category._id })}>
                                <div className="p-4 flex flex-col items-center justify-center">
                                    <h3 className="text-2xl font-bold text-white text-center mb-4 font-dancing">{categoryName}</h3>
                                </div>
                                {product && (
                                    <div className="p-4">
                                        {product._id && (
                                            <ProductCard
                                                product={product}
                                                disableClick={true} // Changed to true
                                                cardColorKey={
                                                    product.availableColors && product.availableColors.length > 0
                                                        ? nameToKeyMap[product.availableColors[colorIndexes[product._id] || 0]] || 'black'
                                                        : 'black'
                                                }
                                                engravingColorKey={'silver'}
                                            />
                                        )}
                                    </div>
                                )}
                                <div className="p-6 flex flex-col items-center justify-center flex-grow">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('category', { id: category._id }); }} // Added e.stopPropagation()
                                        className="btn-premium btn-gold w-full text-sm"
                                    >
                                        {t('viewCategory')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
