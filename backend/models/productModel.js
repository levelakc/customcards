import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    price: { type: Number, required: true, default: 0 },
    availableColors: [{ type: String, required: true }],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    customization: {
        position: { x: { type: Number, default: 45 }, y: { type: Number, default: 10 } },
        scale: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 },
        engraveColors: [{ type: String }] // Added engraveColors
    },
    isUpsellProduct: { type: Boolean, default: false },
    
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;