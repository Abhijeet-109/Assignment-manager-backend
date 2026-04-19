const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
    createTeacherProfile,
    getMyProfile,
    getAllTeachers,
    updateTeacherProfile,
    updateMyProfile,
    deactivateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

// Creating teacher profile / Admin only : true 
router.post('/',protect, authorizeRoles('admin'),createTeacherProfile);

// Fetching teachers profile / teacher and Admin : true
router.get('/my-profile',protect, authorizeRoles('teacher'),getMyProfile);

// Fetching all teachers profile /  Admin only : true
router.get('/all',protect, authorizeRoles('admin'),getAllTeachers);

// Teacher editing their info / Teacher access : true 
router.patch('/my/:id', protect, authorizeRoles('teacher'),updateMyProfile);

// Updating teachers Profile / Admin only access : true
router.put('/:id', protect, authorizeRoles('admin'),updateTeacherProfile);

// Deactivating teacher account /  Admin only access 
router.patch('/:id/deactivate', protect, authorizeRoles('admin'), deactivateTeacher);

// Deleting Teacher account Permenantly / Admin only 
router.delete('/:id', protect, authorizeRoles('admin'), deleteTeacher);

module.exports = router;