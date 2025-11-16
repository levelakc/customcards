import React, { useState, useEffect } from 'react';
import * as api from '../api/api';

export default function SearchPage() {
    const [keyword, setKeyword] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [color, setColor] = useState('');
    const [engraveColor, setEngraveColor] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const availableColors = ['שחור', 'כסף', 'זהב', 'רוז גולד', 'כחול', 'אדום']; // Example colors
    const availableEngraveColors = ['לבן', 'שחור', 'כסף', 'זהב']; // Example engrave colors

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

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold text-white mb-8 text-center">חיפוש מוצרים</h1>

                <form onSubmit={handleSearch} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="keyword" className="block text-sm font-medium text-gray-300">מילת מפתח (שם/תיאור)</label>
                            <input
                                type="text"
                                id="keyword"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300">מחיר מינימלי</label>
                            <input
                                type="number"
                                id="minPrice"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300">מחיר מקסימלי</label>
                            <input
                                type="number"
                                id="maxPrice"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-300">צבע מוצר</label>
                            <select
                                id="color"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            >
                                <option value="">כל הצבעים</option>
                                {availableColors.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="engraveColor" className="block text-sm font-medium text-gray-300">צבע חריטה</label>
                            <select
                                id="engraveColor"
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={engraveColor}
                                onChange={(e) => setEngraveColor(e.target.value)}
                            >
                                <option value="">כל צבעי החריטה</option>
                                {availableEngraveColors.map((ec) => (
                                    <option key={ec} value={ec}>{ec}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        חפש
                    </button>
                </form>

                {loading && <p className="text-center text-indigo-400">טוען תוצאות...</p>}
                {error && <p className="text-center text-red-500">שגיאה: {error}</p>}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((product) => (
                            <div key={product._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                                    <p className="text-gray-300 text-sm mb-2">{product.description.substring(0, 100)}...</p>
                                    <p className="text-lg font-bold text-indigo-400 mb-4">₪{product.price}</p>
                                    <button
                                        onClick={() => { /* navigate to product page */ }}
                                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        צפה במוצר
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && results.length === 0 && (
                    <p className="text-center text-gray-400">לא נמצאו מוצרים תואמים.</p>
                )}
            </div>
        </div>
    );
}