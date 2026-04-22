const express = require('express');
const router = express.Router();
const {
createSelfUpload,
getMySelfUploads,
getSelfUploadById,
deleteSelfUpload,
} = require('../controllers/selfUploadController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Creating self Uploads 
router.post('/', protect, authorizeRoles('student'), createSelfUpload);

// Fetching self uploads
router.get('/', protect, authorizeRoles('student'), getMySelfUploads);

// Fetching self-Uploads by assignment ID 
router.get('/:id', protect, authorizeRoles('student'), getSelfUploadById);

// Deleting self-uploads by ID 
router.delete('/:id',protect, authorizeRoles('student'), deleteSelfUpload);

module.exports = router;