const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const { authorizeRoles } = require('./middleware/roleMiddleware');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentAssignmentRoutes = require('./routes/studentAssignmentRoutes');
const selfUploadRoutes = require('./routes/selfUploadRoutes');
const exportRoutes = require('./routes/exportRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());


/*-----------------------------------All Rest API Routes----------------------------------  */

// Authentication routes 
app.use('/api/auth', authRoutes);

// Assignment routes auth 
app.use('/api/assignments', assignmentRoutes);

// Submission routes 
app.use('/api/submissions', submissionRoutes);

// Notification routes 
app.use('/api/notifications', notificationRoutes);

// Subject routes
app.use('/api/subjects', subjectRoutes);

// Student routes
app.use('/api/student', studentRoutes);

// Teacher routes
app.use('/api/teacher', teacherRoutes);

// Student Assignment Junction routes 
app.use('/api/student-assignments', studentAssignmentRoutes);

// CSV Exporting routes 
app.use('/api/export',exportRoutes);

// Self-Uploads Routes for student-only Access
app.use('/api/self-uploads', selfUploadRoutes);





/*----------------------------------Rest API routes ends----------------------------------------- */


//Api health
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is Running Correctly',
        timestamp: new Date().toISOString(),
    });
});

// Protected test routes
app.get('/api/protected', protect, (req, res) => {
    res.json({
        success: true,
        message: `Hello ${req.user.role}!`, user: req.user
    });
});

app.get('/api/admin-only', protect, authorizeRoles('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Admin access confirmed.',
    });
});

//Error 404 Handling block 
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Routing not found',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;