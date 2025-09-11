import asyncHandler from 'express-async-handler';
import Gallery from '../models/galleryModel.js';

/**
 * @desc    Fetch the gallery images
 * @route   GET /api/gallery
 * @access  Public
 */
const getGallery = asyncHandler(async (req, res) => {
    // There will only ever be one gallery document, so we use findOne.
    const gallery = await Gallery.findOne({});

    if (gallery) {
        res.json(gallery);
    } else {
        // If no gallery document exists yet, it's not an error.
        // We send back a default structure so the frontend doesn't break.
        res.json({ images: [] });
    }
});

/**
 * @desc    Create or update the gallery images
 * @route   POST /api/gallery
 * @access  Private/Admin
 */
const upsertGallery = asyncHandler(async (req, res) => {
    const { images } = req.body;

    // Find the one gallery document.
    let gallery = await Gallery.findOne({});

    if (gallery) {
        // If it exists, update its images array.
        gallery.images = images || gallery.images;
        const updatedGallery = await gallery.save();
        res.json(updatedGallery);
    } else {
        // If it does not exist, create a new one.
        const newGallery = await Gallery.create({ images });
        res.status(201).json(newGallery);
    }
});

export { getGallery, upsertGallery };
