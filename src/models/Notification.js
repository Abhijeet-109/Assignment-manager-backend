const mongoose = require('mongoose');

const notificationSchema  = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        message: {
            type: String,
            required: [true, 'Message is required'],
            trim : true,
        },

        type: {
            type: String,
            enum: ['general','submission','assignment','grade'],
            default: 'general',
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model('Notification',notificationSchema);