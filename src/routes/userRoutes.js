// Path: Main/backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    createTeacher,
    createStudent,
    createAdmin,
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles, requireSuperAdmin } = require('../middleware/roleMiddleware');
const { uploadAvatar } = require('../config/multer');

// Profile routes — any authenticated user
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);
router.delete('/profile/avatar', protect, deleteAvatar);


// All routes below require admin role
router.use(protect, authorizeRoles('admin'));

router.get('/', getAllUsers);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);

router.post('/create-teacher', createTeacher);
router.post('/create-student', createStudent);
router.post('/create-admin', requireSuperAdmin, createAdmin);

module.exports = router;