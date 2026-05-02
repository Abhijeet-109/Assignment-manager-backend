const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentAssignment = require('../models/StudentAssignment');


// ADMIN DASHBOARD
// GET /api/dashboard/admin
const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalAssignments = await Assignment.countDocuments();
        const activeAssignments = await Assignment.countDocuments({ status: 'active' });
        const totalSubmissions = await Submission.countDocuments();
        const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
        const gradedSubmissions = await Submission.countDocuments({ status: 'graded' });
        res.status(200).json({
            success: true,
            data: {
                users: { total: totalUsers, students: totalStudents, teachers: totalTeachers },
                assignments: { total: totalAssignments, active: activeAssignments },
                submissions: { total: totalSubmissions, pending: pendingSubmissions, graded: gradedSubmissions },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TEACHER DASHBOARD
// GET /api/dashboard/teacher?division=A
// division param is optional — if omitted, returns all divisions (default behaviour)
const getTeacherDashboard = async (req, res) => {
    try {
        const { division } = req.query;

        // Base filter: always this teacher's assignments
        const assignmentFilter = { createdBy: req.user._id };

        // Division filter:
        // If teacher selects "Div A", we want assignments targeting 'A' OR 'All'
        // If no division selected, no extra filter needed
        if (division && division !== '') {
            assignmentFilter.$or = [
                { targetDivisions: division },
                { targetDivisions: 'All' }
            ];
        }

        const myAssignments = await Assignment.find(assignmentFilter)
            .select('title status dueDate maxMarks targetDivisions')
            .sort({ createdAt: -1 });

        const myAssignmentIds = myAssignments.map(a => a._id);

        // Count submissions only for this filtered assignment set
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
        res.status(500).json({ success: false, message: error.message });
    }
};


// STUDENT DASHBOARD
// GET /api/dashboard/student
const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const records = await StudentAssignment.find({ studentId: student._id })
            .populate('assignmentId', 'title dueDate maxMarks status')
            .populate('submissionId', 'status obtainedMarks isLate');

        const total = records.length;
        const submitted = records.filter(r => r.status === 'submitted').length;
        const pending = records.filter(r => r.status === 'pending').length;
        const late = records.filter(r => r.status === 'late').length;

        res.status(200).json({
            success: true,
            data: { summary: { total, submitted, pending, late }, assignments: records },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAdminDashboard, getTeacherDashboard, getStudentDashboard };
