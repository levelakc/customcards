import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as api from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';

// --- The Main Checkout Form Component ---
const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { createOrder } = useCart();
    const { navigate } = useRouter();
    const { token } = useAuth();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
            const result = await createOrder(token);
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

    useEffect(() => {
        api.getStripeApiKey().then(data => {
            setStripePromise(loadStripe(data.publishableKey));
        });
    }, []);

    useEffect(() => {
        if (token && cartItems.length > 0) {
            const amount = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100);
            if (amount > 0) {
                api.createPaymentIntent({ amount }, token).then(data => {
                    setClientSecret(data.clientSecret);
                });
            }
        }
    }, [token, cartItems]);

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