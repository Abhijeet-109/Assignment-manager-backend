const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware')

const {signup, login} = require('../controllers/authController');

router.post('/signup', signup); // post/ api/ auth/ signup
router.post('/login', login); // post/ api/ auth/ login
router.get('/me', protect, (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user } });
});


router.post('/logout', protect, async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    res.status(200).json({ success: true, message: 'Logged out.' });
});

module.exports = router;