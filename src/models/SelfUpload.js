const mongoose = require('mongoose');
const selfUploadShcema = new mongoose.Schema(
    {
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },

        description: {
            type: String,
        },

        file: {
            fileUrl: {
                type: String,
                required: [true, 'File URL is required'],
            },
            fileName: {
                type: String,
                required: [true, 'File name is required'],
            },
            fileType: {
                type: String,
                required: true,
            },
        },

        tags: {
            type: [ String ],
            default: [],
        },
    },
    { timestamps: true }
);

const SelfUpload = mongoose.model('SelfUpload',selfUploadShcema);
module.exports = SelfUpload;