
const db = require('./config/db');
const User = require('./models/userModel');
const Connection = require('./models/connectionModel');
const Notification = require('./models/notificationModel');

async function debug() {
    try {
        console.log('--- DEBUG START ---');

        // 1. Find user GopalRao
        const [users] = await db.query("SELECT * FROM users WHERE username = 'GopalRao'");
        if (users.length === 0) {
            console.log('User GopalRao not found!');
            return;
        }
        const user = users[0];
        console.log('User:', { id: user.id, username: user.username });

        // 2. Find notifications for this user
        const notifications = await Notification.getByUser(user.id);
        console.log('Notifications:', notifications);

        // 3. Find pending connections for this user
        const pending = await Connection.getPendingRequests(user.id);
        console.log('Pending Connections:', pending);

        // 4. Find ALL connections involving this user
        const [allConnections] = await db.query("SELECT * FROM connections WHERE sender_id = ? OR receiver_id = ?", [user.id, user.id]);
        console.log('All Connections involving user:', allConnections);

        console.log('--- DEBUG END ---');
    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        process.exit();
    }
}

debug();
