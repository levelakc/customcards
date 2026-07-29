import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

// @desc    Initiate PayPlus payment
// @route   POST /api/payment/initiate
// @access  Public
const initiatePayment = async (req, res) => {
    const { orderId, amount } = req.body;

    try {
        // Find the order to ensure it exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const apiKey = process.env.PAYPLUS_API_KEY;
        const secretKey = process.env.PAYPLUS_SECRET_KEY;
        const pageUuid = process.env.PAYPLUS_PAGE_UUID;

        if (!apiKey || !secretKey || !pageUuid || apiKey === 'your_payplus_api_key_here') {
            // MOCK MODE: Return a mock redirect URL for development
            console.log('PayPlus API keys missing. Running in mock mode.');
            return res.status(200).json({ 
                payment_page_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success`,
                transaction_uid: `mock-txn-${Date.now()}`
            });
        }

        // TODO: Implement actual PayPlus Server-to-Server Token Generation API Call here
        // The API call will use apiKey and secretKey to authorize.
        // It will return a unique payment_page_link which we return to the frontend.
        
        // Mocking the successful response for now until API integration is complete
        res.status(200).json({ 
            payment_page_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success`,
            transaction_uid: `txn-${Date.now()}`
        });

    } catch (error) {
        console.error('Error initiating PayPlus payment:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle PayPlus Server-to-Server Webhook (IPN)
// @route   POST /api/payment/webhook
// @access  Public
const payplusWebhook = async (req, res) => {
    try {
        const { transaction_uid, status_code, more_info } = req.body;
        
        // more_info usually contains our custom payload (like orderId) that we sent during initiatePayment
        // Assuming we pass orderId in the custom field
        const orderId = more_info;

        if (status_code === '000') {
            // 000 is typically the success code for Israeli clearers
            const order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: transaction_uid,
                    status: status_code,
                    update_time: new Date().toISOString(),
                    email_address: req.body.customer_email || ''
                };
                await order.save();
                console.log(`Order ${orderId} marked as paid successfully via PayPlus webhook.`);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PayPlus Webhook Error:', error);
        res.status(500).send('Webhook Error');
    }
};

export { initiatePayment, payplusWebhook };
