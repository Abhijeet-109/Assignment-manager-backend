const express = require('express');
const router = express.Router();
const {protect } = require('../middleware/authMiddleware');
// console.log('protect:', protect);

const {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} = require('../controllers/notificationController');


router.post('/', protect, createNotification);
router.get('/', protect, getMyNotifications);
router.delete('/read-all', protect, deleteAllRead);
router.patch('/read-all', protect,markAllAsRead);
router.patch('/:id/read', protect,markAsRead);
router.delete('/:id', protect, deleteNotification);


module.exports = router;