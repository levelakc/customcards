import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    name: {
        en: { type: String, required: true },
        he: { type: String, required: true },
    },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;