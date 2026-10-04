const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'MySQL 8.0 connected' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start Server after database initialization
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Task Management Server running at http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api/tasks`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
