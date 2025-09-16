import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import ReactTiktok from 'react-tiktok-pixel';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartPopup from './components/CartPopup';
import FloatingWhatsApp from './components/FloatingWhatsApp';

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
import CheckoutPage from './pages/CheckoutPage';

const GOOGLE_ANALYTICS_ID = 'YOUR_GOOGLE_ANALYTICS_ID'; // Replace with your Google Analytics ID
const FACEBOOK_PIXEL_ID = 'YOUR_FACEBOOK_PIXEL_ID'; // Replace with your Facebook Pixel ID
const TIKTOK_PIXEL_ID = 'YOUR_TIKTOK_PIXEL_ID'; // Replace with your TikTok Pixel ID

ReactGA.initialize(GOOGLE_ANALYTICS_ID);
ReactPixel.init(FACEBOOK_PIXEL_ID);
ReactTiktok.init(TIKTOK_PIXEL_ID);

function AppContent() {
    const { route } = useRouter();
    const { showPopup, setShowPopup } = useCart();

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
        ReactPixel.pageView();
        ReactTiktok.pageView();
    }, [route]);


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
            case 'checkout': return <CheckoutPage />;
            default: return <HomePage />;
        }
    };

    return (
        <div dir="rtl" className="bg-gray-900 font-sans">
            <Navbar />
            <main>{renderPage()}</main>
            <Footer />
            <CartPopup isVisible={showPopup} onClose={() => setShowPopup(false)} />
            <FloatingWhatsApp />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <SiteSettingsProvider>
                    <RouterProvider>
                        <AppContent />
                    </RouterProvider>
                </SiteSettingsProvider>
            </CartProvider>
        </AuthProvider>
    );
}
