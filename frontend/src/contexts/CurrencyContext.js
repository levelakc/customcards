import React, { createContext, useState, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('ILS');

  const switchCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const getSymbol = () => {
    return currency === 'ILS' ? '₪' : '$';
  };

  const convert = (amount) => {
    if (currency === 'USD') {
      return amount / 3.7; // Assuming a static exchange rate
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
