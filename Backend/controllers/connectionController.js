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

        // Check if a connection already exists in either direction.
        // Prefer exact-direction checks so we can correctly "re-request" after rejection.
        const exact = await Connection.findExact(senderId, targetUserId);
        const reverse = await Connection.findExact(targetUserId, senderId);

        let connectionId;

        if (exact) {
            if (exact.status === 'blocked') return res.status(403).json({ message: 'Cannot connect with this user' });
            if (exact.status === 'accepted') return res.status(400).json({ message: 'Already connected' });
            if (exact.status === 'pending') return res.status(400).json({ message: 'Connection request already pending' });
            // Re-request after rejection: reset same row back to pending.
            if (exact.status === 'rejected') {
                await Connection.resetToPending(exact.id, senderId, targetUserId);
                connectionId = exact.id;
            }
        } else if (reverse) {
            // If there's a reverse-direction relationship, handle it explicitly.
            if (reverse.status === 'blocked') return res.status(403).json({ message: 'Cannot connect with this user' });
            if (reverse.status === 'accepted') return res.status(400).json({ message: 'Already connected' });
            if (reverse.status === 'pending') {
                // The other user already sent a request; don't create a second one.
                return res.status(400).json({ message: 'You already have a pending request from this user' });
            }
            if (reverse.status === 'rejected') {
                // Re-request after rejection, but the old record is reversed.
                // Flip direction and reset to pending.
                await Connection.resetToPending(reverse.id, senderId, targetUserId);
                connectionId = reverse.id;
            }
        }

        if (!connectionId) {
            connectionId = await Connection.create(senderId, targetUserId);
        }

        // Supersede any previously-active pending request notifications for this pair.
        try {
            await Notification.supersedeActiveConnectionRequests({ userId: targetUserId, senderId });
        } catch (e) {
            console.warn('Failed to supersede older connection_request notifications:', e?.message || e);
        }

        // Create notification linked to the specific connection row.
        await Notification.create({
            userId: targetUserId,
            senderId: senderId,
            connectionId,
            type: 'connection_request',
            message: `You have a new connection request from ${req.user.username}`,
            connectionState: 'pending'
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

        // Resolve the receiver-side request notification for this sender.
        try {
            await Notification.resolveLatestConnectionRequest({
                userId,
                senderId: request.sender_id,
                state: 'accepted'
            });
        } catch (e) {
            console.warn('Failed to resolve connection_request notification (accepted):', e?.message || e);
        }

        // Notify the sender
        await Notification.create({
            userId: request.sender_id,
            senderId: userId,
            connectionId: request.connection_id,
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

        // Resolve the receiver-side request notification for this sender.
        try {
            await Notification.resolveLatestConnectionRequest({
                userId,
                senderId: request.sender_id,
                state: 'rejected'
            });
        } catch (e) {
            console.warn('Failed to resolve connection_request notification (rejected):', e?.message || e);
        }
        
        // Notify the sender that their request was rejected
        await Notification.create({
            userId: request.sender_id,
            senderId: userId,
            connectionId: request.connection_id,
            type: 'connection_rejected',
            message: `${req.user.username} declined your connection request`
        });
        
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
        else if (connection.receiver_id === userId) role = 'receiver';

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

exports.cancelRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) return res.status(400).json({ message: 'Target user ID required' });

        const existing = await Connection.findExact(senderId, targetUserId);
        if (!existing || existing.status !== 'pending') {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        await Connection.deleteConnection(existing.id);

        // Resolve the receiver-side actionable request notification.
        try {
            await Notification.resolveLatestConnectionRequest({ userId: targetUserId, senderId, state: 'cancelled' });
        } catch (e) {
            console.warn('Failed to resolve request notifications during cancel:', e?.message || e);
        }

        res.status(200).json({ message: 'Connection request cancelled' });
    } catch (error) {
        console.error('Cancel Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
