const express = require('express');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const startupProfileRoutes = require('./routes/startupProfileRoutes');
const teamRoutes = require('./routes/teamRoutes');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/userModel');
const Investor = require('./models/investorModel');
const Startup = require('./models/startupModel');
const StartupProfile = require('./models/startupProfileModel');
const Team = require('./models/teamModel');

const corsOptions = {
  origin: 'http://localhost:5173',
}
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Init DB tables
(async () => {
  await User.init();
  await Investor.init();
  await Startup.init();
  await StartupProfile.init();
  await Team.init();
})();

app.use(cors(corsOptions));
// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startup-profile', startupProfileRoutes);
app.use('/api/team', teamRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
