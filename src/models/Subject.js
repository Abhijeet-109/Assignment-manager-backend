const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,' Subject name is required'],
            trim: true,
            unique: true,
        },

        code: {
            type: String,
            required: [ true,'Subject code is required'],
            trim: true,
            unique: true,
            uppercase:true,
        },

        description: {
            type: String,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {timestamp: true}
);

const Subject = mongoose.model('Subject',subjectSchema);
module.exports = Subject;