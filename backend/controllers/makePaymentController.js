import dotenv from 'dotenv';

dotenv.config();

// @desc    Handle Make.com payment redirection
// @route   POST /api/payment/make
const processMakePayment = async (req, res) => {
    const { orderDetails, paymentMethod } = req.body;

    try {
        let webhookUrl = '';
        if (paymentMethod === 'visa') {
            webhookUrl = process.env.MAKE_VISA_WEBHOOK_URL;
        } else if (paymentMethod === 'bit') {
            webhookUrl = process.env.MAKE_BIT_WEBHOOK_URL;
        }

        if (!webhookUrl) {
            return res.status(400).json({ message: 'Payment method webhook not configured' });
        }

        // We return the webhook URL to the frontend, which will then redirect or send data
        // Alternatively, the backend could send the data directly to Make.com and return the response
        // For simplicity and to ensure the user is "redirected" to a payment page (if Make.com provides one)
        // we'll return the URL.
        
        res.status(200).json({ url: webhookUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { processMakePayment };
