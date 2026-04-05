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
            .populate('assignmentId', 'title subject dueDate');

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

        const submissions = await Submission.find({ assignmentId }).populate('submittedBy', 'name email');
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
        const submission = await Submission.find({}).populate('submittedBy', 'name email').populate('assignmentId', 'title subject dueDate');

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

// module exporting 

module.exports = {
    submitAssignment,
    getMySubmission,
    getSubmissionForAssignment,
    updateSubmissionStatus,
    getAllSubmission,
};