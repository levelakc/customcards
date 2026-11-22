import React, { useState, useEffect } from 'react';
import * as api from '../api/api';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
    const { t } = useTranslation();
    const [keyword, setKeyword] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [color, setColor] = useState('');
    const [engraveColor, setEngraveColor] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const availableColors = [
        { value: 'שחור', labelKey: 'black' },
        { value: 'כסף', labelKey: 'silver' },
        { value: 'זהב', labelKey: 'gold' },
        { value: 'רוז גולד', labelKey: 'roseGold' },
        { value: 'צבעוני', labelKey: 'colorful' },
    ];
    const availableEngraveColors = [
        { value: 'שחור', labelKey: 'engravingBlack' },
        { value: 'כסף', labelKey: 'engravingSilver' },
        { value: 'זהב', labelKey: 'engravingGold' },
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (keyword) params.keyword = keyword;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (color) params.color = color;
            if (engraveColor) params.engraveColor = engraveColor;

            const data = await api.searchProducts(params);
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch({ preventDefault: () => {} });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold text-white mb-8 text-center font-dancing">{t('searchProductsTitle')}</h1>

                <form onSubmit={handleSearch} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gold-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="keyword" className="block text-sm font-medium text-gray-300">{t('keywordLabel')}</label>
                            <input
                                type="text"
                                id="keyword"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-gold-500 focus:border-gold-500"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300">{t('minPriceLabel')}</label>
                            <input
                                type="number"
                                id="minPrice"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-gold-500 focus:border-gold-500"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300">{t('maxPriceLabel')}</label>
                            <input
                                type="number"
                                id="maxPrice"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-gold-500 focus:border-gold-500"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-300">{t('productColorLabel')}</label>
                            <select
                                id="color"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-gold-500 focus:border-gold-500"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            >
                                <option value="">{t('allColorsOption')}</option>
                                {availableColors.map((c) => (
                                    <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="engraveColor" className="block text-sm font-medium text-gray-300">{t('engravingColor')}</label>
                            <select
                                id="engraveColor"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-gold-500 focus:border-gold-500"
                                value={engraveColor}
                                onChange={(e) => setEngraveColor(e.target.value)}
                            >
                                <option value="">{t('allEngravingColorsOption')}</option>
                                {availableEngraveColors.map((ec) => (
                                    <option key={ec.value} value={ec.value}>{t(ec.labelKey)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-premium btn-gold"
                    >
                        {t('searchButton')}
                    </button>
                </form>

                {loading && <p className="text-center text-gold-400">{t('loadingResults')}</p>}
                {error && <p className="text-center text-red-500">{t('error')} {error}</p>}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && !error && results.length === 0 && (
                    <p className="text-center text-gray-400">{t('noProductsFound')}</p>
                )}
            </div>
        </div>
    );
}