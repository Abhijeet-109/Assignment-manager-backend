const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');

// 1. Submit Assignment and calculating the dueDate - Student Only 

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, file } = req.body;
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }
        // Calculate isLate 
        const now = new Date();
        const isLate = now > assignment.dueDate;
        // creating the submission document 
        const submission = await Submission.create({
            submittedBy: req.user._id,
            assignmentId,
            file,
            submittedAt: now,
            isLate,
        });

        return res.status(201).json({
            success: true,
            data: submission
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. getMy Submission - Student Only 

const getMySubmission = async (req, res) => {
    try {
        console.log('User ID from token:', req.user._id);
        console.log('Type:', typeof req.user._id);

        const submissions = await Submission.find({ submittedBy: new mongoose.Types.ObjectId(req.user._id) })
            .populate('assignmentId', 'title subject dueDate isLate');

        return res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 3. Get Submission for one assignment - Teacher Only 

const getSubmissionForAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const submissions = await Submission.find({ assignmentId }).populate('submittedBy', 'firstName lastName email');
        return res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 4. Update the submission status - Teacher only 

const updateSubmissionStatus = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }
        const { status, feedback } = req.body;

        submission.status = status || submission.status;
        submission.feedback = feedback || submission.feedback;

        await submission.save();
        return res.status(200).json({
            success: true,
            data: submission,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 5. getAllSubmission - Admin Only 

const getAllSubmission = async (req, res) => {
    try {
        const submission = await Submission.find({}).populate('submittedBy', 'firstName lastName email').populate('assignmentId', 'title subject dueDate isLate');

        return res.status(200).json({
            success: true,
            count: submission.length,
            data: submission,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// New fucntions for the grade module 

const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { obtainedMarks, feedback } = req.body;

        const submission = await Submission.findById(submissionId).populate('assignmentId');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }

        if (submission.assignmentId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only assignment creator can grade submissions',
            });
        }

        const maxMarks = submission.assignmentId.maxMarks

        if (obtainedMarks < 0 || obtainedMarks > maxMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${maxMarks}`,
            });
        }

        // calculating percentage and determine status 
        const percentage = (obtainedMarks / maxMarks) * 100;
        const newStatus = percentage < 35 ? 'rework' : 'graded';

        submission.obtainedMarks = obtainedMarks;
        submission.feedback = feedback;
        submission.status = newStatus;
        submission.gradedAt = Date.now();

        await submission.save();

        //Notification block 

        const Notification = require('../models/Notification');
        await Notification.create({
            userId: submission.submittedBy,
            type: 'grade',
            message: `Your submission for "${submission.assignmentId.title}" has been graded`,
            relatedAssignment: submission.assignmentId._id,
        });

        res.status(200).json({
            success: true,
            message: 'Submission graded successfully',
            data: submission,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateGrade = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { obtainedMarks, feedback } = req.body;

        const submission = await Submission.findById(submissionId).populate('assignmentId');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }
        if (!submission.obtainedMarks && submission.obtainedMarks !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Submission not yet graded. Use gradeSubmission endpoint',
            });
        }

        if (submission.assignmentId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only assignment creator can update grades',
            });
        }

        const maxMarks = submission.assignmentId.maxMarks;

        if (obtainedMarks < 0 || obtainedMarks > maxMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${maxMarks}`,
            });
        }

        //percentage recalculating 

        const percentage = (obtainedMarks / maxMarks) * 100;
        const newStatus = percentage < 35 ? 'rework' : 'graded';

        //updating submission 

        submission.obtainedMarks = obtainedMarks;
        submission.feedback = feedback || submission.feedback;
        submission.status = newStatus;
        submission.gradedAt = Date.now();

        await submission.save();

        return res.status(200).json({
            success: true,
            message: 'Grade updated successfully',
            data: submission,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while updating',
            error: error.message,
        });
    }
}

const getStudentGrades = async (req, res) => {
    try {
        const submissions = await Submission.find(
            {
                submittedBy: req.user._id,
                status: { $in: ['graded', 'rework'] },
            }
        ).populate('assignmentId', 'title subject maxMarks dueDate')
            .populate('submittedBy', 'name email')
            .sort({ gradedAt: -1 });

        if (submissions.length === 0) {
            return res.status(200).json({
                succes: true,
                message: 'No graded submission found',
                data: [],
            });
        }

        const gradesData = submissions.map(sub => ({
            submissionId: sub._id,
            assignment: {
                title: sub.assignmentId.title,
                maxMarks: sub.assignmentId.maxMarks,
            },
            obtainedMarks: sub.obtainedMarks,
            percentage: ((sub.obtainedMarks / sub.assignmentId.maxMarks) * 100).toFixed(2),
            status: sub.status,
            feedback: sub.feedback,
            gradedAt: sub.gradedAt,
            isLate: sub.isLate,
        }));

        return res.status(200).json({
            success: true,
            message: 'Grades retrived successfully',
            count: gradesData.length,
            data: gradesData,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching grades',
            error: error.message,
        });
    }

};

const getAssignmentGrades = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const Assignment = require('../models/Assignment');
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        const submissions = await Submission.find({assignmentId}).populate('submittedBy', 'name email rollNumber').sort({ submittedAt: -1 });

        //calculating stats 

        const stats = {
            total: submissions.length,
            graded: submissions.filter(s => s.status === 'graded').length,
            rework: submissions.filter(s => s.status === 'rework').length,
            pending: submissions.filter(s => s.status === 'pending').length,
        };
        const gradedSubmissions = submissions.filter(
            s => s.obtainedMarks !== undefined && s.obtainedMarks !== null
        );
        const avgMarks = gradedSubmissions.length > 0
            ? (gradedSubmissions.reduce((sum, s) => sum + s.obtainedMarks, 0) /
                gradedSubmissions.length).toFixed(2)
            : 0;


        return res.status(200).json({
            success: true,
            message: 'Assignment graded retrived successfully',
            assignment: {
                title: assignment.title,
                maxMarks: assignment.maxMarks,
            },
            statistics: {
                ...stats,
                averageMarks: avgMarks,
            },
            data: submissions,
        });
    } catch (error){
        console.log('Error in getAssignmentGrades:', error);
         return res.status(500).json({
            success: false,
            message: 'Server error while fetching assignment grades',
            error: error.message,
         });
    }
};

// module exporting 

module.exports = {
    submitAssignment,
    getMySubmission,
    getSubmissionForAssignment,
    updateSubmissionStatus,
    getAllSubmission,
    gradeSubmission,
    updateGrade,
    getStudentGrades,
    getAssignmentGrades,
};