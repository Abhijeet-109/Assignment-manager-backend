const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
     submitAssignment,
        getMySubmission,
        getSubmissionForAssignment,
        updateSubmissionStatus,
        getAllSubmission,
} = require('../controllers/submissionController');

//Post api for student submission - Student submit work
router.post('/',protect,authorizeRoles('student'), submitAssignment);

// Get api/submissions/my - Student view their own assignment/ submission
router.get('/my',protect, authorizeRoles('student'), getMySubmission);

//Get api/submission/all - Admin view all submissions 
router.get('/all',protect, authorizeRoles('admin'), getAllSubmission);

// Get api/submission/assignment/:assignmentId - teacher view subs for one assignment 
router.get('/assignment/:assignmentId', protect, authorizeRoles('teacher'), getSubmissionForAssignment);

// Patch api/submission/:id/status - Teacher updates status and feedback 
router.patch('/:id/status',protect, authorizeRoles('teacher'), updateSubmissionStatus);

module.exports = router;