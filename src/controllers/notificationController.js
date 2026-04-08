const Notification = require('../models/Notification');

const createNotification = async (req, res) => {
    try {
        const { userId, message, type } = req.body;

        const notification = await Notification.create({
            userId,
            message,
            type,
        });

        return res.status(201).json({
            success: true,
            notification,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Getting notification 

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            notifications,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Marks a read for notification 

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                status: false,
                message: 'Notification not found',
            });

        }

        

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Access denied',
            });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({
            status: true,
            notification

        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};

// Mark all as Read 

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.user._id, isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Notification 

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Access denied',
            });
        }

        await Notification.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Module exporting 

module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};