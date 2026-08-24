require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const paymentController = require('./controllers/paymentController');
const { initializeSocket } = require('./utils/socket');
const errorHandler = require('./middleware/errorHandler');

// On Vercel (serverless) this runs for serverless config / cron only.
const isServerless = process.env.VERCEL === '1';

// Kick off the (cached) MongoDB connection in both modes without crashing
// an invocation on startup errors (Mongoose buffers commands while connecting).
connectDB().catch((err) => {
  console.error('Initial MongoDB connection failed:', err.message);
});

const createApp = () => {
  const app = express();

  // CORS
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Stripe webhook needs the raw body for signature verification.
  // Register BEFORE express.json() so the body stays a Buffer.
  app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook
  );

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads (local only; serverless has an ephemeral filesystem)
  if (!isServerless) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'TeleMedicine API is running' });
  });

  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/doctors', require('./routes/doctorRoutes'));
  app.use('/api/appointments', require('./routes/appointmentRoutes'));
  app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
  app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/reviews', require('./routes/reviewRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/chat', require('./routes/chatRoutes'));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

const app = createApp();

// Vercel serverless entry expects the Express app as the default export.
if (isServerless) {
  module.exports = app;
} else {
  // Local development / long-running host: verbatim original behavior.
  const server = http.createServer(app);

  // Socket.io (WebSockets) is NOT supported on Vercel serverless functions.
  try {
    initializeSocket(server);
  } catch (error) {
    console.error('Socket.io init failed:', error.message);
  }

  const PORT = process.env.PORT || 5000;
  if (require.main === module) {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/health`);
    });
  }

  module.exports = { app, server };
}