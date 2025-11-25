import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

export default function CurrencySwitcher() {
    const { currency, switchCurrency } = useCurrency();

    return (
        <div className="flex items-center">
            <button
                onClick={() => switchCurrency('ILS')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currency === 'ILS' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                ILS
            </button>
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <button
                onClick={() => switchCurrency('USD')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currency === 'USD' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                USD
            </button>
        </div>
    );
}
