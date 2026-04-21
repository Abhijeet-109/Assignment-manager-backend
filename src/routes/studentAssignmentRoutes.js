const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const { 
    assignToStudents,
    getMyAssignment,
    markAsViewed,
    getStudentForAssignment,
    removeAssignment 
} = require('../controllers/studentAssignmentController');

// Api routes 

// Admin / Teacher assign Assignment to students 
router.post('/assign', protect, authorizeRoles('admin', 'teacher'),assignToStudents);

// Student fetching their assigned Assignments
router.get('/my', protect, authorizeRoles('student'),getMyAssignment);

//Student marked assignment as Viewed 
router.patch('/:id/view', protect, authorizeRoles('student'),markAsViewed);

// Admin / Teacher assigning studetnt to specific assignment 
router.get('/assignment/:assignmentId', protect, authorizeRoles('admin', 'teacher'), getStudentForAssignment);

// Admin deleting students assignment records 
router.delete('/:id', protect, authorizeRoles('admin'),removeAssignment);

module.exports = router;

