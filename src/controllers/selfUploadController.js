const SelfUpload = require('../models/SelfUpload');
const mongoose = require('mongoose');

// Create a new self-upload entry 

const createSelfUpload = async (req, res) => {
    try {
        const { title, description, file, tags } = req.body;

        const upload = await SelfUpload.create({
            uploadedBy: req.user._id,
            title,
            description,
            file,
            tags,
        });

        return res.status(201).json({
            success: true,
            message: 'Upload saved',
            data: upload,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to upload',
            error: error.message,
        });
    }
};

// Get all self-uploads by the logged-in student 

const getMySelfUploads = async (req, res) => {
    try {
        const uploads = await SelfUpload.find({
            uploadedBy: new mongoose.Types.ObjectId(req.user._id)
        }).sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: uploads.length,
            data: uploads
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch uploads',
            error: error.message,
        });
    }
};

// Get a single self-upload by ID (owner only)

const getSelfUploadById = async (req, res) => {
    try {
        const upload = await SelfUpload.findById(req.params.id);

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found',
            });
        }

        if (upload.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Upload fetched successfully',
            data: upload,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch uploads',
            error: error.message,
        });
    }
};

// Delete Self-upload ( Owner Only )
const deleteSelfUpload = async (req, res) => {
    try {
        const upload = await SelfUpload.findById(req.params.id);

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found',
            });
        }

        if (upload.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        await SelfUpload.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Upload deleted successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Deletion failed',
            error: error.message,
        });
    }
};


//module exporting 

module.exports = {
    createSelfUpload,
    getMySelfUploads,
    getSelfUploadById,
    deleteSelfUpload,

};