const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
    createStudentProfile, 
    getMyProfile, 
    getAllStudents, 
    updateStudentProfile,
    updateMyProfile,
    deleteStudent,
    deactivateStudent
} = require('../controllers/studentController');

// Admin Creates profile 
router.post('/', protect, authorizeRoles('admin'), createStudentProfile);

// Student fetching their profile / Admin access : true 
router.get('/my-profile', protect, authorizeRoles('student'), getMyProfile);

// Fetching all students Profile / Teacher and Admin access : true
router.get('/all', protect, authorizeRoles('admin', 'teacher'), getAllStudents);

// Updating student profile /  Student access only 
router.patch('/my/:id',protect, authorizeRoles('student'), updateMyProfile);

// Updating Student Profile / Admin access only 
router.put('/:id',protect, authorizeRoles('admin'), updateStudentProfile);

// Deactivating Student account / Admin only Access 
router.patch('/:id/deactivate', protect, authorizeRoles('admin', 'teacher'), deactivateStudent);

// Deleting student account Permenatly / Admin only access 
router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);


module.exports = router;
