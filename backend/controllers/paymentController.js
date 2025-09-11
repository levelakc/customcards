import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a payment intent
// @route   POST /api/config/create-payment-intent
const createPaymentIntent = async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'ils',
            // FIX: This is the crucial change. Instead of manually listing payment
            // methods, we tell Stripe to automatically use the ones you've enabled
            // in your dashboard (like PayPal and credit cards).
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Stripe publishable key
// @route   GET /api/config/stripe-key
const getStripeApiKey = (req, res) => {
    res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

export { createPaymentIntent, getStripeApiKey };