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
        // Self-delete protection — req.user is set by authMiddleware
        if (req.params.id === req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin only status changes 
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

        await Student.create({ userId: user._id, enrollmentNumber: enrollmentNumber.toUpperCase(), division, semester: Number(semester), department });

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
// Add to module.exports:
module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    createTeacher,
    createStudent,
    createAdmin
};

