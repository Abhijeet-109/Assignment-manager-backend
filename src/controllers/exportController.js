const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { convertToCSV } = require('../utils/csvExporter');


// Export all submissions for a specific assignment (Teacher/Admin)
const exportAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const submission = await Submission.find({ assignmentId }).populate('submittedBy', 'firstName lastName email').populate('assignmentId', 'title maxMarks dueDate');

        if (!submission.length) {
            return res.status(404).json({
                success: false,
                message: 'No Submission found for this assignment',
            });
        }

        const data = submission.map(s => ({
            StudentName: `${s.submittedBy.firstName} ${s.submittedBy.lastName}`,
            Email: s.submittedBy.email,
            Assignment: s.assignmentId.title,
            MaxMarks: s.assignmentId.maxMarks,
            ObtainedMarks: s.obtainedMarks ?? 'Not graded',
            Status: s.status,
            IsLate: s.isLate ? 'Yes' : 'No',
            SubmittedAt: s.submittedAt.toISOString(),
            Feedback: s.feedback || ' ',
        }));

        const csv = convertToCSV(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="assignment_${assignmentId}.csv"`);

        return res.status(200).send(csv);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Export failed',
            error: error.message,
        });
    }
};

//Export all submissions by a student (Admin only)

const exportStudentSubmissions = async (req, res) => {
    try {
        const { studentId } = req.params;
        const submissions = await Submission.find({ submittedBy: studentId })
            .populate('assignmentId', 'title maxMarks dueDate subject')
            .populate('submittedBy', 'firstName lastName email');
        if (!submissions.length) {
            return res.status(404).json({
                success: false,
                message: 'No submissions found for this student'
            });
        }

        const data = submissions.map(s => ({
            StudentName: `${s.submittedBy.firstName} ${s.submittedBy.lastName}`,
            Email: s.submittedBy.email,
            Assignment: s.assignmentId.title,
            MaxMarks: s.assignmentId.maxMarks,
            ObtainedMarks: s.obtainedMarks ?? 'Not graded',
            Status: s.status,
            IsLate: s.isLate ? 'Yes' : 'No',
            SubmittedAt: s.submittedAt.toISOString(),
        }));

        const csv = convertToCSV(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="student_${studentId}.csv"`);

        return res.status(200).send(csv);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Export failed',
            error: error.message
        });
    }
};

module.exports = {
    exportAssignmentSubmissions,
    exportStudentSubmissions
};