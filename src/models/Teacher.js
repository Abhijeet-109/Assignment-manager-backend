const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'UserId is required'],
            unique: true,
        },

        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },

        department: {
            type: String,
            required: [true, 'Deparment is requires'],
            trim: true,
        },

        designation: {
            type: String,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }

);

const Teacher = mongoose.model('Teacher', teacherSchema);;
module.exports = Teacher;