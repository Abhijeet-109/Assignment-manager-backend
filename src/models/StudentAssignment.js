const mongoose = require('mongoose');

const stdAssignSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, ' Student ID is required'],
        },

        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: [true, 'Assignment ID is required'],
        },

        submissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Submission',
            default: null,  
        },

        status: {
            type: String,
            enum: ['pending', 'submitted', 'late'],
            default: 'pending',
        },

        isViewed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

stdAssignSchema.index({ studentId: 1, assignmentId: 1, }, { unique: true });

const StudentAssignment = mongoose.model('StudentAssignment', stdAssignSchema);
module.exports = StudentAssignment;