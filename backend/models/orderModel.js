import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        color: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        // FIX: The product field is no longer required.
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }],
    messageToDesigner: { type: String }, // New field
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    status: { type: String, required: true, default: 'Processing' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;