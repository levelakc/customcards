import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    // Allow SVG and common raster image types
    const filetypes = /svg|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only SVG, JPG, and PNG images are allowed!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Route for image uploads (SVG, PNG, JPG)
router.post('/image', upload.single('image'), (req, res) => {
    res.send({
        message: 'Image Uploaded',
        image: `/${req.file.path}`,
    });
});

// Route for video uploads
router.post('/video', upload.single('video'), (req, res) => {
    // This part is for video, assuming different validation if needed
    res.send({
        message: 'Video Uploaded',
        video: `/${req.file.path}`,
    });
});

export default router;