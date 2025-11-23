const express = require('express');
require('dotenv').config();
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const startupProfileRoutes = require('./routes/startupProfileRoutes');
const publicRoutes = require('./routes/publicRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoutes');
const startupDockRoutes = require('./routes/startupDockRoutes');
const investorRoutes = require('./routes/investorRoutes'); // ✅ Make sure this is included
const connectionRoutes = require('./routes/connectionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
// Fallback direct import for public investor route if router not registering
const { getInvestorPublicProfile } = require('./controllers/investorController');

// Error handler
const errorHandler = require('./middleware/errorHandler');

// Models
const User = require('./models/userModel');
const Investor = require('./models/investorModel'); // ✅ Make sure this is included
const Startup = require('./models/startupModel');
const StartupProfile = require('./models/startupProfileModel');
const Team = require('./models/teamModel');
const Post = require('./models/postModel');
const StartupDock = require('./models/startupDockModel');
const Connection = require('./models/connectionModel');
const Notification = require('./models/notificationModel');

// Allow multiple local frontend origins during development. Prefer FRONTEND_URL env var when set.
const frontendDefault = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools like curl or server-to-server requests (no origin)
    if (!origin) return callback(null, true);

    const allowed = [frontendDefault, 'http://localhost:5174'];
    if (allowed.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // For other origins, reject (CORS middleware will send appropriate response)
    return callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200
};

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptions));

// Initialize DB tables when starting the server directly.
async function initDb() {
  try {
    await User.init();
    await Investor.init(); // ✅ Ensure Investor model init is called
    await Startup.init();
    await StartupProfile.init();
    await Team.init();
    await Post.init();
    await StartupDock.init();
    await Connection.init();
    await Notification.init();
    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    process.exit(1); // Exit if DB init fails
  }
}

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startup-profile', startupProfileRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/startup-dock', startupDockRoutes);
// Temporary explicit public route (diagnostic) before mounting router
app.use('/api/investors', investorRoutes); // ✅ Ensure investor routes are mounted
app.use('/api/connections', connectionRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized error handler - MUST be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Only start the server if this file is run directly. This allows importing the `app` in tests
// without creating a second listener.
if (require.main === module) {
  // When running the server directly, initialize DB first, then start listening.
  initDb()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to initialize DB:', err);
      process.exit(1);
    });
}

module.exports = app;

