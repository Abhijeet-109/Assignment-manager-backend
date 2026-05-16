const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const os = require('os');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use disk storage to temp folder — no Cloudinary involvement here
const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
});

const uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { upload, uploadAvatar, cloudinary };