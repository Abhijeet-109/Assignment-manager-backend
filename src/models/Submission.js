const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },

        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Assignment',
        },

        file :{

            fileUrl: {
                type: String,
                required: [true, 'File URL is required'],
            },
            fileName: {
                type: String,
                required: [true,'File name is required'],
            },
            fileType: {
                type: String,
                required: true,
            },
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },

        isLate: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ['pending','reviewed','graded'],
            default: 'pending',
        },

        feedback: {
            type: String,
        },
    },
    {timestamps: true}
);

const Submission = mongoose.model('Submission',submissionSchema);

module.exports = Submission;