import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as api from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { getIlsToUsdtRate, convertIlsToUsdt } from '../utils/currencyUtils'; // Import currency utilities

const DELIVERY_FEE_ILS = 100; // Fixed delivery fee in ILS

// --- The Main Checkout Form Component ---
const CheckoutForm = () => {
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
            const result = await createOrder(token, messageToDesigner); // Pass the message
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
                    הודעה למעצב (אופציונלי)
                </label>
                <textarea
                    id="messageToDesigner"
                    name="messageToDesigner"
                    rows="3"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                    value={messageToDesigner}
                    onChange={(e) => setMessageToDesigner(e.target.value)}
                    placeholder="הוסף הוראות מיוחדות או בקשות עיצוב כאן..."
                ></textarea>
            </div>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg disabled:bg-gray-500">
                <span id="button-text">
                    {isLoading ? "מעבד תשלום..." : "שלם עכשיו"}
                </span>
            </button>
            {message && <div id="payment-message" className="text-red-400 text-center mt-4">{message}</div>}
        </form>
    );
};

// --- The Parent Page Component ---
export default function CheckoutPage() {
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const { cartItems } = useCart();
    const { token } = useAuth();
    const [ilsToUsdtRate, setIlsToUsdtRate] = useState(null); // New state for exchange rate

    useEffect(() => {
        api.getStripeApiKey().then(data => {
            setStripePromise(loadStripe(data.publishableKey));
        });
    }, []);

    useEffect(() => {
        const fetchRate = async () => {
            const rate = await getIlsToUsdtRate();
            setIlsToUsdtRate(rate);
        };
        fetchRate();
    }, []);

    useEffect(() => {
        if (token && cartItems.length > 0) {
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
                <h1 className="text-4xl font-extrabold mb-8 text-center">תשלום</h1>
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
                    {/* Order Summary with Delivery Fee and USDT Conversion */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">סיכום הזמנה</h2>
                        <div className="flex justify-between text-lg font-medium text-gray-300">
                            <span>סה"כ פריטים:</span>
                            <span>₪{itemsTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-medium text-gray-300">
                            <span>דמי משלוח והתקנה:</span>
                            <span>₪{DELIVERY_FEE_ILS.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-4 mt-4">
                            <span>סה"כ לתשלום:</span>
                            <span>₪{finalIlsTotal.toFixed(2)}</span>
                        </div>
                        {ilsToUsdtRate && (
                            <div className="flex justify-between text-lg font-medium text-gray-400 mt-2">
                                <span>(בערך ב-USDT):</span>
                                <span>${convertIlsToUsdt(finalIlsTotal, ilsToUsdtRate).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {clientSecret && stripePromise && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}