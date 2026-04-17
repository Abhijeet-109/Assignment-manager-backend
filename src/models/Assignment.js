const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true,'Assignment title is required'],
            trim: true,
        },

        description: {
            type: String,
            required: [true,'Assignment description is required'],
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: [true,'Subject is required'],
        },

        dueDate: {
            type: Date,
            required: [true,'Due date is required'],
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],

        // New changes for grade field 

        maxMarks: {
            type: Number,
            required: [true, 'Max marks are required '],
            min: 1,
        },

        status: {
            type: String,
            enum: ['active','closed'],
            default: 'active',  
        },

    },
    {timestamps:true}
);

const Assignment = mongoose.model('Assignment',assignmentSchema);
module.exports = Assignment;