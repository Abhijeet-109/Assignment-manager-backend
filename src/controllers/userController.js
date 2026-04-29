const User = require('../models/User');

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

// Add to module.exports:
module.exports = { getAllUsers, updateUserRole, deleteUser, toggleUserStatus };

