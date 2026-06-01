import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as api from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CurrencySwitcher from '../components/CurrencySwitcher';

const DELIVERY_FEE_ILS = 50; // Fixed delivery fee in ILS

// --- The Main Checkout Form Component ---
const CheckoutForm = ({ guestInfo }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const { createOrder } = useCart();
    const { navigate } = useRouter();
    const { token } = useAuth();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [messageToDesigner, setMessageToDesigner] = useState(''); // New state for message

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required',
        });

        if (stripeError) {
            setMessage(stripeError.message);
            setIsLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            const result = await createOrder(token, messageToDesigner, guestInfo); // Pass the message and guest info
            if (result.success) {
                navigate('order-success');
            } else {
                setMessage(result.error || 'Failed to save order.');
            }
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="messageToDesigner" className="block text-sm font-medium text-gray-300 mb-1">
                    {t('messageToDesigner')}
                </label>
                <textarea
                    id="messageToDesigner"
                    name="messageToDesigner"
                    rows="3"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                    value={messageToDesigner}
                    onChange={(e) => setMessageToDesigner(e.target.value)}
                    placeholder={t('designerPlaceholder')}
                ></textarea>
            </div>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" className={`btn-premium w-full mt-10 text-xl py-4 ${isLoading || !stripe || !elements ? 'opacity-50 cursor-not-allowed' : 'btn-gold'}`}>
                <span id="button-text">
                    {isLoading ? t('processingPayment') : t('payNow')}
                </span>
            </button>
            {message && <div id="payment-message" className="text-red-400 text-center mt-4">{message}</div>}
        </form>
    );
};

// --- The Parent Page Component ---
export default function CheckoutPage() {
    const { t } = useTranslation();
    const { getSymbol, convert } = useCurrency();
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const { cartItems } = useCart();
    const { user, token } = useAuth();
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        postalCode: '',
        phone: '',
    });

    const handleGuestInfoChange = (e) => {
        setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        api.getStripeApiKey().then(data => {
            setStripePromise(loadStripe(data.publishableKey));
        });
    }, []);

    useEffect(() => {
        if (cartItems.length > 0) {
            // Calculate total amount including delivery fee for payment intent
            const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const amount = Math.round((itemsTotal + DELIVERY_FEE_ILS) * 100); // Add delivery fee here
            
            if (amount > 0) {
                api.createPaymentIntent({ amount }, token).then(data => {
                    setClientSecret(data.clientSecret);
                });
            }
        }
    }, [token, cartItems]);

    // Calculate totals for display
    const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalIlsTotal = itemsTotal + DELIVERY_FEE_ILS;

    // FIX: The options object is now simplified. The clientSecret contains all the
    // necessary information for Stripe to render the correct payment methods.
    const options = {
        clientSecret,
        appearance: { theme: 'night', labels: 'floating' },
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4 space-x-4">
                    <LanguageSwitcher />
                    <CurrencySwitcher />
                </div>
                <h1 className="text-5xl font-extrabold mb-12 text-center gold-gradient-text font-dancing">{t('checkout')}</h1>
                <div className="glass-panel p-10">
                    {!user && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-6 gold-gradient-text border-b border-gray-700 pb-2">{t('shippingDetails')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('fullName')}</label>
                                    <input type="text" name="name" id="name" value={guestInfo.name} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('email')}</label>
                                    <input type="email" name="email" id="email" value={guestInfo.email} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-300">{t('streetAddress')}</label>
                                    <input type="text" name="street" id="street" value={guestInfo.street} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-300">{t('city')}</label>
                                    <input type="text" name="city" id="city" value={guestInfo.city} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300">{t('postalCode')}</label>
                                    <input type="text" name="postalCode" id="postalCode" value={guestInfo.postalCode} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">{t('phone')}</label>
                                    <input type="tel" name="phone" id="phone" value={guestInfo.phone} onChange={handleGuestInfoChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Order Summary with Delivery Fee */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('orderSummary')}</h2>
                        <div className="flex justify-between text-lg font-medium text-white">
                            <span>{t('itemsTotal')}:</span>
                            <span>{getSymbol()}{convert(itemsTotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-medium text-white">
                            <div className="relative flex items-center">
                                <span className="mr-2">{t('deliveryFee')}:</span>
                                <div className="group relative">
                                    <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer">
                                        <span className="text-white text-sm font-bold">i</span>
                                    </div>
                                    <div className="absolute bottom-full mb-2 w-64 bg-gray-700 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                        We deliver and install your card in person to ensure your security. Payment is completed upon delivery, so you don't need to share your card details online.
                                    </div>
                                </div>
                            </div>
                            <span>{getSymbol()}{convert(DELIVERY_FEE_ILS).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-4 mt-4">
                            <span>{t('total')}:</span>
                            <span>{getSymbol()}{convert(finalIlsTotal).toFixed(2)}</span>
                        </div>
                    </div>

                    {clientSecret && stripePromise && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm guestInfo={guestInfo} />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}