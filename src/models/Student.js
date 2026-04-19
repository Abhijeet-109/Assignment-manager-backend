const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'UserId is required'],
            unique: true,
        },

        enrollmentNumber: {
            type: String,
            required: [true, 'Enrollment Number is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },

        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: [1, 'Min semester is 1'],
        },

        department: {
            type: String,
            required: [true, 'Deparment is required'],
            trim: true,
        },

        division: {
            type: String,
            required: [true, 'Division is required'],
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

    },

    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;