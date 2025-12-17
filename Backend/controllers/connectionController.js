const Connection = require('../models/connectionModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

exports.sendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) return res.status(400).json({ message: 'Target user ID required' });
        if (senderId === targetUserId) return res.status(400).json({ message: 'Cannot connect with yourself' });

        // Validate users
        const sender = await User.findById(senderId);
        const target = await User.findById(targetUserId);

        if (!sender || !target) return res.status(404).json({ message: 'User not found' });

        const allowedTypes = ['investor', 'startup'];
        if (!allowedTypes.includes(sender.userType) || !allowedTypes.includes(target.userType)) {
            return res.status(403).json({ message: 'Only startups and investors can connect' });
        }

        // Check if connection already exists
        const existing = await Connection.findByUsers(senderId, targetUserId);
        if (existing) {
            if (existing.status === 'blocked') return res.status(403).json({ message: 'Cannot connect with this user' });
            if (existing.status === 'accepted') return res.status(400).json({ message: 'Already connected' });
            if (existing.status === 'pending') return res.status(400).json({ message: 'Connection request already pending' });
            // If rejected, maybe allow re-request? For now, let's say no.
            if (existing.status === 'rejected') return res.status(400).json({ message: 'Connection request was rejected' });
        }

        await Connection.create(senderId, targetUserId);

        // Create notification
        await Notification.create({
            userId: targetUserId,
            senderId: senderId,
            type: 'connection_request',
            message: `You have a new connection request from ${req.user.username}`
        });

        res.status(200).json({ message: 'Connection request sent' });
    } catch (error) {
        console.error('Send Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { connectionId, senderId } = req.body;

        console.log(`\n--- ACCEPT REQUEST DEBUG ---`);
        console.log(`User ID (from token): ${userId} (Type: ${typeof userId})`);
        console.log(`Request Body:`, req.body);
        console.log(`Target Sender ID: ${senderId} (Type: ${typeof senderId})`);

        const pending = await Connection.getPendingRequests(userId);
        console.log(`Pending Requests Found: ${pending.length}`);
        pending.forEach((p, i) => {
            console.log(`[${i}] ConnectionID: ${p.connection_id}, SenderID: ${p.sender_id} (Type: ${typeof p.sender_id})`);
        });

        let request;

        if (connectionId) {
            request = pending.find(r => r.connection_id === parseInt(connectionId));
        } else if (senderId) {
            request = pending.find(r => r.sender_id === parseInt(senderId));
        }

        if (!request) {
            console.log('!!! MATCH FAILED !!!');
            console.log('Checking for existing accepted connection...');

            // Check if already connected (idempotency)
            if (senderId) {
                const existing = await Connection.findByUsers(userId, senderId);
                console.log('Existing connection check:', existing);
                if (existing && existing.status === 'accepted') {
                    console.log('Connection already accepted. Returning success.');
                    return res.status(200).json({ message: 'Already connected' });
                }
            }

            console.log('Returning 404.');
            return res.status(404).json({
                message: 'Connection request not found or not for you',
                debug: {
                    userId,
                    receivedSenderId: senderId,
                    pendingRequests: pending
                }
            });
        }

        console.log(`Match Found! Accepting connection ${request.connection_id}`);
        await Connection.updateStatus(request.connection_id, 'accepted');

        // Notify the sender
        await Notification.create({
            userId: request.sender_id,
            senderId: userId,
            type: 'connection_accepted',
            message: `${req.user.username} accepted your connection request`
        });

        res.status(200).json({ message: 'Connection accepted' });
    } catch (error) {
        console.error('Accept Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { connectionId, senderId } = req.body;

        const pending = await Connection.getPendingRequests(userId);
        let request;

        if (connectionId) {
            request = pending.find(r => r.connection_id === parseInt(connectionId));
        } else if (senderId) {
            request = pending.find(r => r.sender_id === parseInt(senderId));
        }

        if (!request) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        await Connection.updateStatus(request.connection_id, 'rejected');
        res.status(200).json({ message: 'Connection rejected' });
    } catch (error) {
        console.error('Reject Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        // Check if connection exists
        const existing = await Connection.findByUsers(userId, targetUserId);
        if (existing) {
            await Connection.updateStatus(existing.id, 'blocked');
        } else {
            // Create a blocked connection record
            // We need to insert with status blocked.
            // The create method defaults to pending. We need a custom create or update immediately.
            // Let's just insert manually here or add method to model.
            // I'll use the model's create then update.
            const newId = await Connection.create(userId, targetUserId);
            await Connection.updateStatus(newId, 'blocked');
        }

        res.status(200).json({ message: 'User blocked' });
    } catch (error) {
        console.error('Block User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConnections = async (req, res) => {
    try {
        const rawConnections = await Connection.getConnections(req.user.id);

        const connections = rawConnections.map(conn => {
            const out = { ...conn };
            if (out.image) {
                console.log(`[DEBUG] Connection ${out.username} (${out.userType}): image type=${typeof out.image}, isBuffer=${Buffer.isBuffer(out.image)}`);
                if (typeof out.image === 'string') {
                    console.log(`[DEBUG] Image string prefix: ${out.image.substring(0, 50)}`);
                } else if (Buffer.isBuffer(out.image)) {
                    console.log(`[DEBUG] Image buffer length: ${out.image.length}`);
                }
            }

            if (out.image && Buffer.isBuffer(out.image)) {
                if (out.userType === 'investor') {
                    // Investor images are stored as Base64 strings but returned as Buffers
                    out.image = out.image.toString('utf8');
                } else {
                    // Startup logos are stored as BLOBs (binary)
                    try {
                        const b64 = out.image.toString('base64');
                        const mime = out.image_mime || 'application/octet-stream';
                        out.image = `data:${mime};base64,${b64}`;
                    } catch (e) {
                        console.error('Failed to convert connection image buffer:', e);
                        out.image = null;
                    }
                }
            }
            return out;
        });

        res.status(200).json({ connections });
    } catch (error) {
        console.error('Get Connections Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const rawRequests = await Connection.getPendingRequests(req.user.id);

        const requests = rawRequests.map(req => {
            const out = { ...req };
            if (out.image && Buffer.isBuffer(out.image)) {
                if (out.userType === 'investor') {
                    out.image = out.image.toString('utf8');
                } else {
                    try {
                        const b64 = out.image.toString('base64');
                        const mime = out.image_mime || 'application/octet-stream';
                        out.image = `data:${mime};base64,${b64}`;
                    } catch (e) {
                        console.error('Failed to convert request image buffer:', e);
                        out.image = null;
                    }
                }
            }
            return out;
        });

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get Pending Requests Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConnectionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.params;

        const connection = await Connection.findByUsers(userId, targetUserId);

        if (!connection) {
            return res.status(200).json({ status: 'none' });
        }

        let role = 'none';
        if (connection.sender_id === userId) role = 'sender';
        if (connection.receiver_id === parseInt(userId)) role = 'receiver'; // Ensure type match if needed

        res.status(200).json({
            status: connection.status,
            role: role,
            connectionId: connection.id
        });
    } catch (error) {
        console.error('Get Connection Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
