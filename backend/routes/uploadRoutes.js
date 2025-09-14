import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// --- Configuration for saving files ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Use the original fieldname (e.g., 'image' or 'video') in the filename
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// --- Validation function ONLY for images ---
function checkImageFileType(file, cb) {
    const filetypes = /svg|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // This error is now specific to images
        cb(new Error('Only SVG, JPG, and PNG images are allowed!'));
    }
}

// --- Validation function ONLY for videos ---
function checkVideoFileType(file, cb) {
    const filetypes = /mp4|mov|avi|mkv/; // Add any other video formats you want to support
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/'); // A more reliable check for video files

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // This error is now specific to videos
        cb(new Error('Only MP4, MOV, AVI, and MKV videos are allowed!'));
    }
}

// --- Multer instance for handling IMAGE uploads ---
const uploadImage = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkImageFileType(file, cb);
    },
});

// --- Multer instance for handling VIDEO uploads ---
const uploadVideo = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkVideoFileType(file, cb);
    },
});


// --- ROUTE DEFINITIONS ---

// Route for image uploads (uses the image-specific uploader)
router.post('/image', uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload an image file.' });
    }
    res.send({
        message: 'Image Uploaded',
        image: `/${req.file.path.replace(/\\/g, "/")}`, // Standardize path separators
    });
});

// Route for video uploads (uses the video-specific uploader)
router.post('/video', uploadVideo.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a video file.' });
    }
    res.send({
        message: 'Video Uploaded',
        video: `/${req.file.path.replace(/\\/g, "/")}`, // Standardize path separators
    });
});

export default router;
