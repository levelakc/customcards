// CustomCard/frontend/src/utils/currencyUtils.js

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate.host/latest';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

let exchangeRateCache = {
    rate: null,
    timestamp: null,
};

export const getIlsToUsdtRate = async () => {
    const now = Date.now();
    if (exchangeRateCache.rate && exchangeRateCache.timestamp && (now - exchangeRateCache.timestamp < CACHE_DURATION)) {
        return exchangeRateCache.rate;
    }

    try {
        const response = await fetch(`${EXCHANGE_RATE_API_URL}?base=ILS&symbols=USD`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // ExchangeRate.host provides rates relative to the base currency.
        // So, data.rates.USD will be 1 USD = X ILS.
        // We need 1 ILS = Y USD. So, 1 / data.rates.USD.
        const ilsToUsdRate = 1 / data.rates.USD;

        // Now, we need USD to USDT. For simplicity, we'll assume 1 USD = 1 USDT.
        // In a real-world scenario, you might fetch this separately or use a crypto-specific API.
        const ilsToUsdtRate = ilsToUsdRate; 

        exchangeRateCache = {
            rate: ilsToUsdtRate,
            timestamp: now,
        };
        return ilsToUsdtRate;
    } catch (error) {
        console.error("Error fetching ILS to USDT exchange rate:", error);
        // Fallback to a default rate or throw an error
        return null; 
    }
};

export const convertIlsToUsdt = (ilsAmount, ilsToUsdtRate) => {
    if (ilsToUsdtRate === null) {
        console.warn("ILS to USDT exchange rate not available. Cannot convert.");
        return null;
    }
    return ilsAmount * ilsToUsdtRate;
};
