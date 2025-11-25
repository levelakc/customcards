import React from 'react';
import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';
import './index.css';
import App from './App';
import './i18n';
import { CurrencyProvider } from './contexts/CurrencyContext';

const tagManagerArgs = {
  gtmId: 'GTM-YOUR_ID'
}

TagManager.initialize(tagManagerArgs);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </React.StrictMode>
);
