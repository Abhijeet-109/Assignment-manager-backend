//Very restricted module 
// Creation Admin only 

const Subject = require('../models/Subject');

const createSubject = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const existingSubject = await Subject.findOne({ code: code.toUpperCase() });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Subject with this code already exists',
            });
        }

        const subject = await Subject.create({
            name,
            code,
            description,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Fetching All subjects
// Access: All authentic users

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('createdBy', 'name emaul').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Fetching Subject by their ID 
// Access: All authentic users

const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('createdBy', 'name email');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }
        res.status(200).json({
            success: true,
            data: subject
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Updating Subject 
//Access: Admin Only

const updateSubject = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const subject = await Subject.findByIdAndUpdate(req.params.id,
            {
                name, code, description
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: subject,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Deleting a subject 
// Access: Admin only 

const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subject deletes successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Exporting all Modules 

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
};