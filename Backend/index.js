const express = require('express');
require('dotenv').config();
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const startupProfileRoutes = require('./routes/startupProfileRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoutes');
const startupDockRoutes = require('./routes/startupDockRoutes');
const investorRoutes = require('./routes/investorRoutes'); // ✅ Make sure this is included

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

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Use env var or default
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
app.use('/api/team', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/startup-dock', startupDockRoutes);
app.use('/api/investors', investorRoutes); // ✅ Ensure investor routes are mounted

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

