import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils'; // Import color utility functions

export default function CategoryPage() {
    const { route } = useRouter();
    const { id } = route.params;
    const { t, i18n } = useTranslation();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [colorIndexes, setColorIndexes] = useState({}); // State to manage color indexes for each product
    const colorIntervalRef = useRef(null); // Ref to store the interval ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const allProducts = await api.getProducts();
                const allCategories = await api.getCategories();
                
                const currentCategory = allCategories.find(c => String(c._id) === String(id));
                const productsInCategory = allProducts.filter(p => String(p.category?._id) === String(id));

                setCategory(currentCategory);
                setProducts(productsInCategory);

                // Initialize color indexes for newly fetched products
                const initialColorIndexes = {};
                productsInCategory.forEach(product => {
                    if (product && product._id) {
                        initialColorIndexes[product._id] = 0;
                    }
                });
                setColorIndexes(initialColorIndexes);

            } catch (error) {
                console.error("Failed to fetch category data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, i18n.language]);

    // Effect for dynamic color changing
    useEffect(() => {
        if (products.length > 0) {
            colorIntervalRef.current = setInterval(() => {
                setColorIndexes(prevIndexes => {
                    const newIndexes = { ...prevIndexes };
                    products.forEach(product => {
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
    }, [products]);

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען קטגוריה...</div>;
    if (!category) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">קטגוריה לא נמצאה.</div>;

    const currentLanguage = i18n.language || 'he';
    const categoryName = category.name?.[currentLanguage] || category.name?.he || category.name?.en || category.name || '';

    const filteredProducts = products.filter(product => {
        const name = product.name?.[currentLanguage] || product.name?.he || product.name?.en || product.name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-extrabold text-white font-dancing">{categoryName}</h1>
                    
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => {
                            const cardColorKey = 
                                product.availableColors && product.availableColors.length > 0
                                    ? nameToKeyMap[product.availableColors[colorIndexes[product._id] || 0]] || 'black'
                                    : 'black';
                            const engravingColorKey = 
                                product.availableColors && product.availableColors.length > 0
                                    ? (product.customization?.engraveColors && product.customization.engraveColors.length > 0
                                        ? product.customization.engraveColors[0]
                                        : getDefaultEngraving(nameToKeyMap[product.availableColors[colorIndexes[product._id] || 0]] || 'black'))
                                    : getDefaultEngraving('black');
                            
                            return (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                    cardColorKey={cardColorKey}
                                    engravingColorKey={engravingColorKey}
                                />
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