const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const bcrypt = require('bcryptjs');

// GET /api/users — Admin only
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -tokenVersion').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: { users } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/:id — Admin: update role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'teacher', 'student'].includes(role))
            return res.status(400).json({ success: false, message: 'Invalid role' });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -tokenVersion');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id — Admin only
const deleteUser = async (req, res) => {
    try {

        if (req.params.id === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete your own account.'
            });
        }

        // NEW: Prevent deleting Super Admin
        const target = await User.findById(req.params.id);

        if (!target) return res.status(404).json({
            success: false,
            message: 'User not found'
        });

        if (target.isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete a Super Admin account.'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin only status changes 
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({
            success: false,
            message: 'User not found'
        });

        user.isActive = !user.isActive;
        user.status = user.isActive ? 'active' : 'inactive';

        await user.save();

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Admin creating Teacher Accounts

const createTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, password, employeeId, department, designation } = req.body;

        // 1. Validate required fields
        if (!firstName || !lastName || !email || !password || !employeeId || !department) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.'
            });
        }

        // 2. Check duplicate email
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // 3. Create User with role: teacher
        const user = await User.create({ firstName, lastName, email, password, role: 'teacher' });

        // 4. Create Teacher profile
        await Teacher.create({
            userId: user._id,
            employeeId: employeeId.toUpperCase(),
            department,
            designation: designation || '',
        });

        res.status(201).json({
            success: true,
            message: 'Teacher account created successfully.',
            data: {
                user: { _id: user._id, firstName, lastName, email, role: 'teacher' }
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID or Email already exists.'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


// Creating Admin 

const createAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {

            return res.status(400).json({
                success: false,
                message: 'All fields required.'
            });
        }
        const exists = await User.findOne({ email: email.toLowerCase() });

        if (exists) return res.status(400).json({
            success: false,
            message: 'Email already registered.'
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'admin'
        });

        return res.status(201).json({
            success: true, message: 'Admin account created.',
            data: { user: { _id: user._id, firstName, lastName, email, role: 'admin' } }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Creating Student Admin only 

const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password, enrollmentNumber, division, semester, department } = req.body;

        if (!firstName || !lastName || !email || !password || !enrollmentNumber || !division || !semester || !department) {
            return res.status(400).json({
                success: false,
                message: 'All fields required.'
            });
        }
        const exists = await User.findOne({ email: email.toLowerCase() });

        if (exists) return res.status(400).json({
            success: false,
            message: 'Email already registered.'
        });

        const user = await User.create({ firstName, lastName, email, password, role: 'student' });

        try {
            await Student.create({ userId: user._id, enrollmentNumber: enrollmentNumber.toUpperCase(), division, semester: Number(semester), department });
        } catch (studentError) {
            // Rollback — delete the user if student profile creation fails
            await User.findByIdAndDelete(user._id);
            if (studentError.code === 11000) {
                return res.status(400).json({ success: false, message: 'Enrollment number already exists.' });
            }
            return res.status(400).json({ success: false, message: studentError.message });
        }

       res.status(201).json({
            success: true,
            message: 'Student account created.',
            data: {
                user: {
                    _id: user._id,
                    firstName,
                    lastName,
                    email,
                    role: 'student'
                }
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Enrollment number already exists.'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET /api/users/profile — Any authenticated user
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -tokenVersion');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PUT /api/users/profile — Any authenticated user
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Update name fields if provided
        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();

        // Password change — only if both fields provided
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);


            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters'
                });
            }

            user.password = newPassword; // pre-save hook hashes it
        }

        await user.save();

        const updated = await User.findById(user._id).select('-password -tokenVersion');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully', data: { user: updated }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PUT /api/users/profile/avatar — Any authenticated user
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Delete old avatar file from disk if it exists
        if (user.avatar) {
            const oldPath = require('path').join(__dirname, '../../../', user.avatar);
            require('fs').unlink(oldPath, (err) => {
                if (err) console.warn('Old avatar delete failed:', err.message);
            });
        }

        // Save new avatar path (relative URL for serving via /uploads)
        user.avatar = req.file.path.replace(/\\/g, '/'); // normalize Windows backslashes
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: { avatarUrl: user.avatar },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.avatar) {
            const oldPath = require('path').join(__dirname, '../../../', user.avatar);
            require('fs').unlink(oldPath, (err) => {
                if (err) console.warn('Avatar delete failed:', err.message);
            });
        }

        user.avatar = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Avatar removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Add to module.exports:
module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    createTeacher,
    createStudent,
    createAdmin,
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
};

