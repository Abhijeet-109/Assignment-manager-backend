// Path: Main/backend/src/config/multer.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Submission upload (PDFs, docs, etc.) ──────────────────────────
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const submissionFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.zip', '.txt', '.xlsx', '.xls', '.pptx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type "${ext}" is not allowed`), false);
};

const upload = multer({
    storage: submissionStorage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: submissionFilter,
});

// ── Avatar upload (images only) ───────────────────────────────────
const avatarDir = 'uploads/avatars';
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const avatarFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: avatarFilter,
});

module.exports = { upload, uploadAvatar };