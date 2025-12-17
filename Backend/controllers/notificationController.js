const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getByUser(req.user.id);
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        await Notification.markAsRead(notificationId, userId);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsUnread = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        await Notification.markAsUnread(notificationId, userId);
        res.status(200).json({ message: 'Notification marked as unread' });
    } catch (error) {
        console.error('Mark Unread Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
