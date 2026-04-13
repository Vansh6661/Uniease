const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Imports
const connectMongoDB = require('./src/config/mongodb');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const complaintRoutes = require('./src/routes/complaints.routes');
const foodRoutes = require('./src/routes/food.routes');
const laundryRoutes = require('./src/routes/laundry.routes');

// Initialize Express
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(morgan('combined')); // Logging
const corsOptions = process.env.NODE_ENV === 'production'
  ? {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }
  : {
      origin: true,
      credentials: true,
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', complaintRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/laundry', laundryRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ✅  UniEase Backend v2.0 Running                         ║
║  🌐  Server: http://localhost:${PORT}                         ║
║  📱  LAN: http://YOUR_MAC_IP:${PORT}                        ║
║  📦  MongoDB: Connected                                   ║
║  💾  PostgreSQL: Ready to connect                         ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
