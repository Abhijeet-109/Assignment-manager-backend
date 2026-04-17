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
        gradeSubmission,
        updateGrade,
        getStudentGrades,
        getAssignmentGrades,
} = require('../controllers/submissionController');

//Post api for student submission - Student submit work/ Assignment
router.post('/', protect, authorizeRoles('student'), submitAssignment);

// Get api/submissions/my - Student view their own assignment/ submission
router.get('/my', protect, authorizeRoles('student'), getMySubmission);

//Get api/submission/all - Admin view all submissions 
router.get('/all', protect, authorizeRoles('admin'), getAllSubmission);

// Get api/submission/assignment/:assignmentId - teacher view subs for one assignment 
router.get('/assignment/:assignmentId', protect, authorizeRoles('teacher'), getSubmissionForAssignment);

// Patch api/submission/:id/status - Teacher updates status and feedback 
router.patch('/:id/status', protect, authorizeRoles('teacher'), updateSubmissionStatus);



//------------------------------------- New routes for updated code---------------------------//

// Grade a submission
router.post('/grade/:submissionId', protect, authorizeRoles('teacher'), gradeSubmission);

// Update existing grade
router.put('/update-grade/:submissionId', protect, authorizeRoles('teacher'),updateGrade);

//Student view their grades
router.get('/my-grades',protect, authorizeRoles('student'), getStudentGrades);

//teacher Views gradebook for assignment 
router.get('/gradebook/:assignmentId', protect, authorizeRoles('teacher'),getAssignmentGrades);




module.exports = router;