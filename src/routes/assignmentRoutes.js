const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');


const {
        createAssignment,
        getAllAssignment,
        //getMyAssignment,
        updateAssignmet,
        deleteAssignment,
        getTeacherAssignments
} = require('../controllers/assignmentController');

// API for techer creating assignment post method 
router.post('/',protect, authorizeRoles('teacher'), createAssignment);
    
// Admin views all assignment API get method 
router.get('/',protect, authorizeRoles('admin'),getAllAssignment);

// // Student view their assignment 
// router.get('/my',protect, authorizeRoles('student'),getMyAssignment);

// New route as requirement 
// Teacher gets their own assignments
router.get('/teacher', protect, authorizeRoles('teacher'), getTeacherAssignments);

// teacher updates their assignments
router.put('/:id',protect, authorizeRoles('teacher'),updateAssignmet);

// Teacher or admin deleting assignment 
router.delete('/:id',protect, authorizeRoles('teacher','admin'),deleteAssignment);

module.exports = router;

