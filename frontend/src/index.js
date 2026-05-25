import React from 'react';
import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';
import './index.css';
import App from './App';
import i18n from './i18n'; // Import the i18n instance
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import { CurrencyProvider } from './contexts/CurrencyContext';

const tagManagerArgs = {
  gtmId: 'GTM-YOUR_ID'
}

TagManager.initialize(tagManagerArgs);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}> {/* Wrap App with I18nextProvider */}
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </I18nextProvider>
  </React.StrictMode>
);
