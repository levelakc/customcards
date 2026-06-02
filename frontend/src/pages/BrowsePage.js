import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import { ALL_CARD_COLORS } from '../utils/colorUtils';
import { useRouter } from '../contexts/RouterContext';

export default function BrowsePage() {
    const { t } = useTranslation();
    const { route, navigate } = useRouter();
    const { products, categories, isGlobalLoading } = useData();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [shuffledProducts, setShuffledProducts] = useState([]);

    // Derived state from URL params
    const selectedCategory = route.params.category || null;
    const selectedColors = route.params.colors ? route.params.colors.split(',') : [];
    const searchTerm = route.params.q || '';

    // Shuffle products on initial load or when products change
    useEffect(() => {
        if (products && products.length > 0) {
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            setShuffledProducts(shuffled);
        }
    }, [products]);

    const updateFilters = (newParams) => {
        const updatedParams = { ...route.params, ...newParams };
        // Remove empty values
        Object.keys(updatedParams).forEach(key => {
            if (!updatedParams[key] || updatedParams[key] === '') {
                delete updatedParams[key];
            }
        });
        navigate('browse', updatedParams);
    };

    const toggleColor = (color) => {
        const newColors = selectedColors.includes(color) 
            ? selectedColors.filter(c => c !== color) 
            : [...selectedColors, color];
        updateFilters({ colors: newColors.join(',') });
    };

    const handleCategoryClick = (catId) => {
        updateFilters({ category: catId === selectedCategory ? null : catId });
    };

    const handleSearchChange = (e) => {
        updateFilters({ q: e.target.value });
    };

    const filteredProducts = shuffledProducts.filter(product => {
        const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
        const matchesColor = selectedColors.length === 0 || 
            (product.availableColors && product.availableColors.some(color => selectedColors.includes(color)));
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesCategory && matchesColor && matchesSearch;
    });

    if (isGlobalLoading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">{t('loadingData')}...</div>;

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* Page Header */}
            <div className="bg-black/50 border-b border-gray-800 py-12 mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold font-dancing gold-gradient-text mb-4">
                        {t('browseProducts')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('heroDescription')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-8">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                    >
                        <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        {isSidebarOpen ? t('closeFilters') : t('filterDesigns')}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Futuristic Sidebar Filters */}
                    <aside className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
                        <div className="glass-panel p-8 sticky top-28 z-30 space-y-10">
                            
                            {/* Search Section */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-4">{t('search')}</h3>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder={t('filterDesigns')}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-gold-500/50 transition-all text-sm text-white"
                                    />
                                    <svg className="absolute right-4 top-2.5 h-5 w-5 text-gray-500 group-focus-within:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Collections Section */}
                            <div className="border-t border-white/5 pt-8">
                                <h3 className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-6">{t('collections')}</h3>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => handleCategoryClick(null)}
                                        className={`btn-premium text-xs py-3 ${!selectedCategory ? 'btn-gold' : 'btn-obsidian border-white/10 text-gray-400 hover:text-white'}`}
                                    >
                                        {t('allProducts')}
                                    </button>
                                    {categories.map(cat => (
                                        <button 
                                            key={cat._id}
                                            onClick={() => handleCategoryClick(cat._id)}
                                            className={`btn-premium text-xs py-3 ${selectedCategory === cat._id ? 'btn-gold' : 'btn-obsidian border-white/10 text-gray-400 hover:text-white'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors Section */}
                            <div className="border-t border-white/5 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{t('finish')}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {ALL_CARD_COLORS.map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => toggleColor(color)}
                                            className={`w-full aspect-square rounded-2xl border-2 transition-all duration-500 transform hover:scale-110 flex items-center justify-center relative overflow-hidden ${selectedColors.includes(color) ? 'border-gold-500 color-dot-active' : 'border-white/10 hover:border-white/30'}`}
                                            title={t(color)}
                                        >
                                            <div 
                                                className="absolute inset-1 rounded-[10px] shadow-inner"
                                                style={{ 
                                                    backgroundColor: color === 'gold' ? '#d4af37' : color === 'silver' ? '#c0c0c0' : color === 'black' ? '#111' : color === 'roseGold' ? '#b76e79' : color === 'colorful' ? 'linear-gradient(45deg, #f06, #4a90e2, #2ecc71)' : '#333',
                                                    background: color === 'colorful' ? 'linear-gradient(45deg, #f06, #4a90e2, #2ecc71)' : undefined
                                                }}
                                            />
                                            {selectedColors.includes(color) && (
                                                <svg className="w-5 h-5 text-white z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inventory Stats (Sidebar Footer) */}
                            <div className="border-t border-white/5 pt-8 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-500 font-bold mb-1">{t('inventory')}</span>
                                    <p className="text-white text-sm font-medium">
                                        <span className="text-xl font-black text-gold-400">{filteredProducts.length}</span> {t('products')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => updateFilters({ category: null, colors: null, q: null })}
                                    className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors font-bold"
                                >
                                    {t('reset')}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-grow pb-24">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                                {filteredProducts.map(product => (
                                    <div key={product._id} className="transition-all duration-500 hover:translate-y-[-8px]">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-gray-900/50 rounded-3xl border border-gray-800 backdrop-blur-sm">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-6 border border-gray-700">
                                    <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-300 mb-2">{t('noProductsFound')}</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('noSalesByCategory')}</p>
                                <button 
                                    onClick={() => updateFilters({ category: null, colors: null, q: null })}
                                    className="btn-premium btn-obsidian px-10"
                                >
                                    {t('clearAllFilters')}
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
