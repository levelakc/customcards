import React, { createContext, useState, useContext, useEffect } from 'react';
import { getIlsToUsdtRate } from '../utils/currencyUtils';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('ILS');
  const [ilsToUsdRate, setIlsToUsdRate] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getIlsToUsdtRate();
      setIlsToUsdRate(rate);
    };
    fetchRate();
  }, []);

  const switchCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const getSymbol = () => {
    return currency === 'ILS' ? '₪' : '$';
  };

  const convert = (amount) => {
    if (currency === 'USD' && ilsToUsdRate) {
      return amount * ilsToUsdRate;
    }
    return amount;
  };

  return (
    <CurrencyContext.Provider value={{ currency, switchCurrency, getSymbol, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
