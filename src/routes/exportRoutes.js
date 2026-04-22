const express = require('express');
const router = express.Router();
const { exportAssignmentSubmissions, exportStudentSubmissions } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Exporting assignment Submissions teacher and admin-only 
router.get('/assignment/:assignmentId', protect, authorizeRoles('teacher', 'admin'), exportAssignmentSubmissions);

// Exporting student submission admin only 
router.get('/student/:studentId', protect, authorizeRoles('admin'), exportStudentSubmissions);

module.exports = router;