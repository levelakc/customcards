import React, { useEffect, useState } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { DataProvider, useData } from './contexts/DataContext';
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import { useTranslation } from 'react-i18next';

import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Footer from './components/Footer';
import CartPopup from './components/CartPopup';
import FloatingWidgets from './components/FloatingWidgets';
import LoadingScreen from './components/LoadingScreen';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import AccessibilityPage from './pages/AccessibilityPage';
import PolicyPage from './pages/PolicyPage';
import TermsPage from './pages/TermsPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchPage from './pages/SearchPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import BrowsePage from './pages/BrowsePage'; // NEW: Import BrowsePage

const GOOGLE_ANALYTICS_ID = 'YOUR_GOOGLE_ANALYTICS_ID'; // Replace with your Google Analytics ID
const FACEBOOK_PIXEL_ID = 'YOUR_FACEBOOK_PIXEL_ID'; // Replace with your Facebook Pixel ID

if (GOOGLE_ANALYTICS_ID && GOOGLE_ANALYTICS_ID !== 'YOUR_GOOGLE_ANALYTICS_ID') {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID);
}

if (FACEBOOK_PIXEL_ID && FACEBOOK_PIXEL_ID !== 'YOUR_FACEBOOK_PIXEL_ID') {
    ReactPixel.init(FACEBOOK_PIXEL_ID);
}

function AppContent() {
    const { route } = useRouter();
    const { showPopup, setShowPopup } = useCart();
    const { i18n } = useTranslation();
    const { isGlobalLoading } = useData();
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinLoadingComplete(true);
        }, 2500); // 2.5 seconds minimum loading screen
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (GOOGLE_ANALYTICS_ID && GOOGLE_ANALYTICS_ID !== 'YOUR_GOOGLE_ANALYTICS_ID') {
            ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
        }
        if (FACEBOOK_PIXEL_ID && FACEBOOK_PIXEL_ID !== 'YOUR_FACEBOOK_PIXEL_ID') {
            ReactPixel.pageView();
        }
    }, [route]);

    if (isGlobalLoading || !minLoadingComplete) {
        return <LoadingScreen />;
    }

    const renderPage = () => {
        switch (route.page) {
            case 'home': return <HomePage />;
            case 'category': return <CategoryPage />;
            case 'product': return <ProductPage />;
            case 'login': return <LoginPage />;
            case 'register': return <RegisterPage />;
            case 'admin': return <AdminPage />;
            case 'cart': return <CartPage />;
            case 'order-success': return <OrderSuccessPage />;
            case 'profile': return <ProfilePage />;
            case 'accessibility': return <AccessibilityPage />;
            case 'policy': return <PolicyPage />;
            case 'terms': return <TermsPage />;
            case 'checkout': return <CheckoutPage />;
            case 'search': return <SearchPage />;
            case 'all-categories': return <AllCategoriesPage />;
            case 'browse': return <BrowsePage />; // NEW: Add BrowsePage route
            default: return <HomePage />;
        }
    };

    return (
        <div dir={i18n.dir()} className="w-full overflow-x-hidden bg-gray-900 font-sans">
            <Navbar />
            <main className="pt-20">
                <Breadcrumbs />
                {renderPage()}
            </main>
            <Footer />
            <CartPopup isVisible={showPopup} onClose={() => setShowPopup(false)} />
            <FloatingWidgets />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <SiteSettingsProvider>
                    <DataProvider>
                        <RouterProvider>
                            <AppContent />
                        </RouterProvider>
                    </DataProvider>
                </SiteSettingsProvider>
            </CartProvider>
        </AuthProvider>
    );
}

