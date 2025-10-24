const express = require('express');
require('dotenv').config();
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const startupProfileRoutes = require('./routes/startupProfileRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoutes'); // ✅ added

// Error handler
const errorHandler = require('./middleware/errorHandler');

// Models
const User = require('./models/userModel');
const Investor = require('./models/investorModel');
const Startup = require('./models/startupModel');
const StartupProfile = require('./models/startupProfileModel');
const Team = require('./models/teamModel');
const Post = require('./models/postModel'); // ✅ added

const corsOptions = {
  origin: 'http://localhost:5173',
};

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptions));

// ✅ Initialize DB tables (auto-creates them if not existing)
(async () => {
  await User.init();
  await Investor.init();
  await Startup.init();
  await StartupProfile.init();
  await Team.init();
  await Post.init(); // ✅ added
})();

// ✅ Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startup-profile', startupProfileRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/posts', postRoutes); // ✅ new posts/blogs route

// ✅ Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));