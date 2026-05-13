const User = require('../models/User');
const Subject = require('../models/Subject')
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
// STUDENT DASHBOARD
// GET /api/dashboard/student
const getStudentDashboard = async (req, res) => {
    try {
        const Subject = require('../models/Subject');

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        // All StudentAssignment records for this student
        const records = await StudentAssignment.find({ studentId: student._id })
            .populate({
                path: 'assignmentId',
                select: 'title dueDate maxMarks status subject',
                populate: { path: 'subject', select: 'name' }
            })
            .populate('submissionId', 'status obtainedMarks isLate');

        // Deduplicate: keep only one record per assignmentId (latest)
        const seen = new Set();
        const uniqueRecords = records.filter(r => {
            const id = r.assignmentId?._id?.toString();
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        const total = uniqueRecords.length;
        const completed = uniqueRecords.filter(r =>
            r.submissionId && ['graded', 'reviewed', 'pending'].includes(r.submissionId.status) && r.submissionId.status !== 'rework'
        ).length;


        const pending = total - completed;
        const late = uniqueRecords.filter(r => r.submissionId?.isLate).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const now = new Date();
        const upcomingDeadlines = uniqueRecords
            .filter(r => {
                const isSubmitted = r.submissionId &&
                    (r.submissionId.status === 'submitted' || r.submissionId.status === 'graded');
                const dueDate = r.assignmentId?.dueDate;
                return !isSubmitted && dueDate && new Date(dueDate) > now;
            })
            .sort((a, b) => new Date(a.assignmentId.dueDate) - new Date(b.assignmentId.dueDate))
            .slice(0, 5)
            .map(r => ({
                title: r.assignmentId?.title,
                subjectName: r.assignmentId?.subject?.name || 'N/A',
                dueDate: r.assignmentId?.dueDate,
                daysLeft: Math.ceil((new Date(r.assignmentId.dueDate) - now) / 86400000),
            }));

        // Subject progress — group by subject
        const subjectMap = {};
        uniqueRecords.forEach(r => {
            const subId = r.assignmentId?.subject?._id?.toString();
            const subName = r.assignmentId?.subject?.name || 'Unknown';
            if (!subId) return;
            if (!subjectMap[subId]) subjectMap[subId] = { subjectName: subName, total: 0, completed: 0 };
            subjectMap[subId].total++;
            const isSubmitted = r.submissionId &&
                (r.submissionId.status === 'submitted' || r.submissionId.status === 'graded');
            if (isSubmitted) subjectMap[subId].completed++;
        });
        const subjectProgress = Object.values(subjectMap).map(s => ({
            ...s,
            percentage: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
        }));

        const totalSubjects = subjectProgress.length;

        res.status(200).json({
            success: true,
            data: {
                totalSubjects,
                totalAssignments: total,
                completedAssignments: completed,
                pendingAssignments: pending,
                lateAssignments: late,
                completionRate,
                upcomingDeadlines,
                subjectProgress,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAdminDashboard, getTeacherDashboard, getStudentDashboard };
