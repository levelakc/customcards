import React, { useState, useEffect } from 'react';
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
            {/* Page Header */}
            <div className="bg-black/50 border-b border-gray-800 py-12 mb-8">
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
                {/* Futuristic Filter Bar */}
                <div className="filter-glass rounded-3xl p-6 mb-16 flex flex-col gap-8 sticky top-28 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 group">
                    
                    {/* Top Row: Search and Stats */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-[450px]">
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('filterDesigns')}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-14 focus:outline-none focus:border-gold-500/50 transition-all shadow-2xl placeholder:text-gray-600 text-white"
                            />
                            <svg className="absolute left-5 top-4.5 h-6 w-6 text-gray-500 group-focus-within:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-500 font-bold mb-1">{t('inventory')}</span>
                                <p className="text-white text-sm font-medium">
                                    {t('showing')} <span className="text-xl font-black text-gold-400">{filteredProducts.length}</span> {t('products')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden w-full bg-white/5 border border-white/10 px-8 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                {isSidebarOpen ? t('closeFilters') : t('filterDesigns')}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Categories and Colors (Collapsible on Mobile) */}
                    <div className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-10 items-start lg:items-center border-t border-white/5 pt-8`}>
                        
                        {/* Categories Horizontal List */}
                        <div className="w-full lg:border-l border-white/5 lg:pl-10">
                            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></div>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{t('collections')}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className={`category-pill px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 border ${!selectedCategory ? 'bg-gold-500 text-black border-gold-500 shadow-[0_10px_30px_rgba(212,175,55,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'}`}
                                >
                                    {t('allProducts')}
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat._id}
                                        onClick={() => setSelectedCategory(cat._id)}
                                        className={`category-pill px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 border ${selectedCategory === cat._id ? 'bg-gold-500 text-black border-gold-500 shadow-[0_10px_30px_rgba(212,175,55,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colors Palette */}
                        <div className="flex-shrink-0 lg:min-w-[200px]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{t('finish')}</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {ALL_CARD_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className={`w-10 h-10 rounded-2xl border-2 transition-all duration-500 transform hover:scale-110 flex items-center justify-center relative overflow-hidden ${selectedColors.includes(color) ? 'border-gold-500 color-dot-active' : 'border-white/10 hover:border-white/30'}`}
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
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="pb-24">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                                onClick={() => {setSelectedCategory(null); setSelectedColors([]); setSearchTerm('');}}
                                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gold-500 border border-gold-500/30 rounded-full font-bold transition-all"
                            >
                                {t('clearAllFilters')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
