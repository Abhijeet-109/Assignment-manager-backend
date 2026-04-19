const Teacher = require('../models/Teacher');
const User = require('../models/User');

// Creating teacher profile 
// Acess: Admin-only

const createTeacherProfile = async (req, res) => {
    try {
        const { userId, employeeId, department, designation } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({
                success: false,
                message: 'Access denied! User is not teacher.',
            });
        }

        const existing = await Teacher.findOne({ userId });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Profile already exist.',
            });
        }

        const profile = await Teacher.create(
            {
                userId, employeeId, department, designation
            }
        );
        return res.status(201).json({
            success: true,
            message: 'Profile created successfully.',
            data: profile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Fetching Teacher profile 
// Access: Teacher and admin only

const getMyProfile = async (req, res) => {
    try {
        const profile = await Teacher.findOne({ userId: req.user._id }).populate('userId', 'firstName lastName email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: profile,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Fetching all teachers profiles 
// Access: Admin-only

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ isActive: true }).populate('userId', 'firstName lastName email');

        if (!teachers) {
            return res.status(404).json({
                success: false,
                message: 'Student Profiles not found',
            });
        }

        return res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Updating Teachers Profile 
// Access: Admin-only

const updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        delete updates.userId;

        const profile = await Teacher.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated',
            data: profile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update My profile 
// Access: Teacher -Allowing teacher to edit some information  

const updateMyProfile = async (req, res) => {
    try {
        const allowed = ['firstName', 'lastName'];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field]) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true, select: '-password' }
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated',
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Deleting teacher profile 

// Soft delete 
const deactivateTeacher = async (req, res) => {
    try {
        const profile = await Teacher.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Teacher deactivated',
            data: profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Hard deletion - Permenant 

const deleteTeacher = async (req, res) => {
    try {
        const profile = await Teacher.findByIdAndDelete(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });

        }
        return res.status(200).json({
            success: true,
            message: 'Teacher Profile permanently deleted'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createTeacherProfile,
    getMyProfile,
    getAllTeachers,
    updateTeacherProfile,
    updateMyProfile,
    deactivateTeacher,
    deleteTeacher
};

