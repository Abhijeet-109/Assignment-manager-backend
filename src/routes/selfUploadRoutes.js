const express = require('express');
const router = express.Router();
const {
    createSelfUpload,
    createSelfUploadFile,
    getMySelfUploads,
    getSelfUploadById,
    deleteSelfUpload,
} = require('../controllers/selfUploadController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

// Drive link upload (JSON body)
router.post('/', protect, authorizeRoles('student'), createSelfUpload);

// Local file upload — multer error is caught and forwarded as JSON
router.post(
    '/file',
    protect,
    authorizeRoles('student'),
    (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error',
                });
            }
            next();
        });
    },
    createSelfUploadFile
);

// Fetch all uploads
router.get('/', protect, authorizeRoles('student'), getMySelfUploads);

// Fetch single upload
router.get('/:id', protect, authorizeRoles('student'), getSelfUploadById);

// Delete upload
router.delete('/:id', protect, authorizeRoles('student'), deleteSelfUpload);

module.exports = router;