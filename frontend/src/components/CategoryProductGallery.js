import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';
import * as api from '../api/api';
import ProductCard from './ProductCard'; // Assuming ProductCard is in the same directory or accessible
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils'; // Import color utility functions

export default function CategoryProductGallery() {
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const [categoriesWithRandomProduct, setCategoriesWithRandomProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [colorIndexes, setColorIndexes] = useState({}); // State to manage color indexes for each product
    const colorIntervalRef = useRef(null); // Ref to store the interval ID

    const fetchCategoryProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCategories = await api.getCategories();

            if (!fetchedCategories || fetchedCategories.length === 0) {
                setCategoriesWithRandomProduct([]);
                setLoading(false);
                return;
            }

            const results = await Promise.all(
                fetchedCategories.map(async (category) => {
                    try {
                        const products = await api.searchProducts({ category: category._id });
                        if (products && products.length > 0) {
                            const randomIndex = Math.floor(Math.random() * products.length);
                            return { category, product: products[randomIndex] };
                        }
                        return { category, product: null }; // Category with no products
                    } catch (prodErr) {
                        console.error(`Failed to fetch products for category ${category._id}:`, prodErr);
                        return { category, product: null };
                    }
                })
            );
            const validResults = results.filter(item => item.product !== null);
            setCategoriesWithRandomProduct(validResults);

            // Initialize color indexes for newly fetched products
            const initialColorIndexes = {};
            validResults.forEach(({ product }) => {
                if (product && product._id) {
                    initialColorIndexes[product._id] = 0;
                }
            });
            setColorIndexes(initialColorIndexes);

        } catch (err) {
            console.error("Failed to fetch categories or products in fetchCategoryProducts:", err);
            setError(t('failedToLoadCategories')); // Localize error message
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCategoryProducts();
    }, [fetchCategoryProducts]);

    // Effect for dynamic color changing
    useEffect(() => {
        if (categoriesWithRandomProduct.length > 0) {
            colorIntervalRef.current = setInterval(() => {
                setColorIndexes(prevIndexes => {
                    const newIndexes = { ...prevIndexes };
                    categoriesWithRandomProduct.forEach(({ product }) => {
                        if (product && product._id && product.availableColors) {
                            const availableColors = product.availableColors || [];
                            if (availableColors.length > 1) {
                                newIndexes[product._id] = ((prevIndexes[product._id] || 0) + 1) % availableColors.length;
                            }
                        }
                    });
                    return newIndexes;
                });
            }, 1500); // Change color every 1.5 seconds
        }

        return () => {
            if (colorIntervalRef.current) {
                clearInterval(colorIntervalRef.current);
            }
        };
    }, [categoriesWithRandomProduct]);

    if (loading) {

        return <div className="text-center text-white py-10">{t('loadingCategoriesAndProducts')}</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
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
                    {categoriesWithRandomProduct.map(({ category, product }) => (
                        <div key={category._id} className="bg-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col cursor-pointer" onClick={() => navigate('category', { id: category._id })}>
                            <div className="p-4 flex flex-col items-center justify-center">
                                <h3 className="text-2xl font-semibold text-white text-center mb-4">{category.name.en || category.name.he}</h3>
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
                            <div className="p-4 flex flex-col items-center justify-center flex-grow">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate('category', { id: category._id }); }} // Added e.stopPropagation()
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full text-md transition duration-300 transform hover:scale-105"
                                >
                                    {t('viewCategory')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
