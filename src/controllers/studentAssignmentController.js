const StudentAssignment = require('../models/StudentAssignment');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');


// Admin or Teacher assign Assignment to one or many students 
const assignToStudents = async (req, res) => {
    try {
        const { assignmentId, studentIds } = req.body;

        if (!assignmentId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({
                success: false,
                message: 'Assignment ID and array are required.',
            });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        // Building Docs - skiping the duplicate using upsert pattern 

        const result = [];
        for (const studentId of studentIds) {
            const doc = await StudentAssignment.findOneAndUpdate(
                { studentId, assignmentId },
                { studentId, assignmentId },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            result.push(doc);
        }

        return res.status(200).json({
            success: true,
            message: 'Assignment assigned successfully',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Student - Get all asssignment assigned to me 

const getMyAssignment = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found.",
            });
        }

        const records = await StudentAssignment.find({ studentId: student._id }).populate('assignmentId', 'title description dueDate maxMarks status subject').populate('submissionId', 'fileUrl submittedAt');

        return res.status(200).json({
            success: true,
            message: 'Assignments fetched',
            count: records.length,
            data: records,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// STUDENT: Mark assignment as viewed
const markAsViewed = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
            });
        }
        const record = await StudentAssignment.findOneAndUpdate(
            { _id: req.params.id, studentId: student._id },
            { isViewed: true },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found or unauthorized',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Marked as viewed',
            data: record,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// Teacher / Admin : Get all student assigned to a specific assignment 

const getStudentForAssignment = async (req, res) => {
    try {
        const records = await StudentAssignment.find({ assignmentId: req.params.assignmentId }).populate('studentId', 'enrollmentNumber semester department division').populate('submissionId', 'fileUrl submittedAt');

        return res.status(200).json({
            success: true,
            message: 'Students fetched',
            count: records.length,
            data: records,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// Admin : Remove a student-assignment records ( hard deletion )

const removeAssignment = async (req, res) => {
    try {
        const records = await StudentAssignment.findByIdAndDelete(req.params.id);

        if (!records) {
            return res.status(404).json({
                success: false,
                message: 'Records not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Records deleted successfully',
            data: records,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// Module exporting 

module.exports = {
    assignToStudents,
    getMyAssignment,
    markAsViewed,
    getStudentForAssignment,
    removeAssignment,
};

