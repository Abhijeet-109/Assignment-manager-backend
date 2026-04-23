const express = require('express');
const router = express.Router();
const { getAdminDashboard, getTeacherDashboard, getStudentDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Getiing admin dashboard 
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);

// Getting Teacher dashboard
router.get('/teacher', protect, authorizeRoles('teacher'), getTeacherDashboard);

// Fetching student dashboard
router.get('/student', protect, authorizeRoles('student'), getStudentDashboard);

module.exports = router;