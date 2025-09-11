import mongoose from 'mongoose';

// The gallery schema is simple: it holds an array of strings, where each string is a URL to an image.
const gallerySchema = mongoose.Schema(
    {
        // We will only have one document for the gallery, and it will contain all image paths.
        images: {
            type: [String], // Defines 'images' as an array of strings
            required: true,
            default: [], // Defaults to an empty array if not provided
        },
    },
    {
        // Automatically add `createdAt` and `updatedAt` timestamps
        timestamps: true,
    }
);

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
