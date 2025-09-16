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
        import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import path from 'path';

const router = express.Router();

// Use memory storage to get file buffer
const storage = multer.memoryStorage();

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

const uploadImage = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkImageFileType(file, cb);
    },
});

const uploadVideo = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkVideoFileType(file, cb);
    },
});

const uploadToCloudinary = (file, options) => {
    return new Promise((resolve, reject) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        cloudinary.uploader.upload(dataURI, options, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};

router.post('/image', uploadImage.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload an image file.' });
    }
    try {
        const result = await uploadToCloudinary(req.file, { resource_type: 'image' });
        res.send({
            message: 'Image Uploaded',
            image: result.secure_url,
        });
    } catch (error) {
        res.status(500).send({ message: 'Error uploading to Cloudinary', error });
    }
});

router.post('/video', uploadVideo.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a video file.' });
    }
    try {
        const result = await uploadToCloudinary(req.file, { resource_type: 'video' });
        res.send({
            message: 'Video Uploaded',
            video: result.secure_url,
        });
    } catch (error) {
        res.status(500).send({ message: 'Error uploading to Cloudinary', error });
    }
});

export default router;
 // Standardize path separators
    });
});

// Route for video uploads (uses the video-specific uploader)
router.post('/video', uploadVideo.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a video file.' });
    }
    res.send({
        message: 'Video Uploaded',
        video: `/${req.file.path.replace(/\\/g, "/")}` // Standardize path separators
    });
});

export default router;