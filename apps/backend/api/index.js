const express = require('express');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/userModel');
const Investor = require('./models/investorModel');
const Startup = require('./models/startupModel');

const corsOptions = {
  origin: 'http://localhost:5173',
}
const app = express();
app.use(express.json());

// Init DB tables
(async () => {
  await User.init();
  await Investor.init();
  await Startup.init();
})();

app.use(cors(corsOptions));
// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
