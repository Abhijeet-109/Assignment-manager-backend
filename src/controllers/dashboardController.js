const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentAssignment = require('../models/StudentAssignment');


// ADMIN DASHBOARD
// GET /api/dashboard/admin
// Access: Admin only
const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalAssignments = await Assignment.countDocuments();
        const activeAssignments = await Assignment.countDocuments({ status: 'active' });
        const totalSubmissions = await Submission.countDocuments();
        const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
        const gradedSubmissions = await Submission.countDocuments({ status: 'graded' });
        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers
                },

                assignments: {
                    total: totalAssignments,
                    active: activeAssignments
                },

                submissions: {
                    total: totalSubmissions,
                    pending: pendingSubmissions,
                    graded: gradedSubmissions
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// TEACHER DASHBOARD
// GET /api/dashboard/teacher
// Access: Teacher only
const getTeacherDashboard = async (req, res) => {
    try {
        // Teacher's assignments = createdBy matches logged-in user's _id
        const myAssignments = await Assignment.find({ createdBy: req.user._id })
            .select('title status dueDate maxMarks')
            .sort({ createdAt: -1 });

        const myAssignmentIds = myAssignments.map(a => a._id);

        // Submissions for teacher's assignments
        const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: myAssignmentIds } });
        const pendingReview = await Submission.countDocuments({ assignmentId: { $in: myAssignmentIds }, status: 'pending' });
        const gradedSubmissions = await Submission.countDocuments({ assignmentId: { $in: myAssignmentIds }, status: 'graded' });
        res.status(200).json({
            success: true,
            data: {
                totalAssignments: myAssignments.length,
                assignments: myAssignments,
                submissions: {
                    total: totalSubmissions,
                    pending: pendingReview,
                    graded: gradedSubmissions,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// STUDENT DASHBOARD
// GET /api/dashboard/student
// Access: Student only

const getStudentDashboard = async (req, res) => {
    try {
        // Find student profile from logged-in user
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {

            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }


        // Get all junction records for this student
        const records = await StudentAssignment.find({ studentId: student._id })
            .populate('assignmentId', 'title dueDate maxMarks status')
            .populate('submissionId', 'status obtainedMarks isLate');

        const total = records.length;
        const submitted = records.filter(r => r.status === 'submitted').length;
        const pending = records.filter(r => r.status === 'pending').length;
        const late = records.filter(r => r.status === 'late').length;
        res.status(200).json({
            success: true,
            data: {
                summary: { total, submitted, pending, late },
                assignments: records,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAdminDashboard,
    getTeacherDashboard,
    getStudentDashboard
};