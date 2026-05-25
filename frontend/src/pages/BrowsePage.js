import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import { ALL_CARD_COLORS } from '../utils/colorUtils';

export default function BrowsePage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedColors, setSelectedColors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allProducts, allCategories] = await Promise.all([
                    api.getProducts(),
                    api.getCategories()
                ]);
                setProducts(allProducts);
                setCategories(allCategories);
            } catch (error) {
                console.error("Failed to fetch browse data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleColor = (color) => {
        setSelectedColors(prev => 
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
        const matchesColor = selectedColors.length === 0 || 
            (product.availableColors && product.availableColors.some(color => selectedColors.includes(color)));
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesCategory && matchesColor && matchesSearch;
    });

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">{t('loadingData')}...</div>;

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold font-dancing">{t('browseProducts')}</h1>
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            {isSidebarOpen ? t('closeFilters') : t('filterDesigns')}
                        </button>
                    </div>

                    {/* Sidebar / Filters */}
                    <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-8 flex-shrink-0`}>
                        
                        {/* Search */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">{t('search')}</h3>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('filterDesigns')}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">{t('categories')}</h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                                >
                                    {t('allProducts')}
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat._id}
                                        onClick={() => setSelectedCategory(cat._id)}
                                        className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat._id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">{t('color')}</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {ALL_CARD_COLORS.map(color => (
                                    <label key={color} className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={selectedColors.includes(color)}
                                            onChange={() => toggleColor(color)}
                                            className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                                        />
                                        <span className={`transition-colors ${selectedColors.includes(color) ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                            {t(color)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="hidden lg:flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                            <h1 className="text-3xl font-extrabold font-dancing">{t('browseProducts')}</h1>
                            <p className="text-gray-400 text-sm">
                                {t('showing')} {filteredProducts.length} {t('products')}
                            </p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700">
                                <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-300">{t('noProductsFound')}</h3>
                                <button 
                                    onClick={() => {setSelectedCategory(null); setSelectedColors([]); setSearchTerm('');}}
                                    className="mt-4 text-indigo-400 hover:text-indigo-300 underline"
                                >
                                    {t('clearAllFilters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
