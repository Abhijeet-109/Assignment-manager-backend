const Student = require('../models/Student');

const User = require('../models/User'); // Allowing student to update some information
// Creating Profile for new User as a Student 
// Access: Admin-only

const createStudentProfile = async (req, res) => {
    try {
        const { userId, enrollmentNumber, semester, department, division } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.role !== 'student') {
            return res.status(400).json({
                success: false,
                message: 'Access denied! User is not Student.',
            });
        }

        const existing = await Student.findOne({ userId });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Profile already exist.',
            });
        }

        const profile = await Student.create(
            {
                userId,
                enrollmentNumber,
                department,
                division,
                semester
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

//Student sees own Profile 
//Acess: Student and Admin 

const getMyProfile = async (req, res) => {
    try {
        const profile = await Student.findOne({ userId: req.user._id }).populate('userId', 'firstName lastName email');

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


// Get All student 
// Access: Admin and Teacher

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({ isActive: true }).populate('userId', 'firstName lastName email');

        if (!students) {
            return res.status(404).json({
                success: false,
                message: 'Student Profiles not found',
            });
        }

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Student Profile 
// Access: Admin-only

const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        delete updates.userId;

        const profile = await Student.findByIdAndUpdate(
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

// Updating My profile 
// Access: Student - Allowing Student to edit some personal information 

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

// Deleting student profile 
// Soft Delete — Deactivate Student
// Access: Admin only
const deactivateStudent = async (req, res) => {
    try {
        const profile = await Student.findByIdAndUpdate(
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
            message: 'Student deactivated',
            data: profile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Hard Delete — Permanent
// Access: Admin only
const deleteStudent = async (req, res) => {
    try {
        const profile = await Student.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Student permanently deleted'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Module exporting 

module.exports = {
    createStudentProfile,
    getMyProfile,
    getAllStudents,
    updateStudentProfile,
    updateMyProfile,
    deleteStudent,
    deactivateStudent
};


