import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import queueRoutes from './routes/queues.js';
import tokenRoutes from './routes/tokens.js';
import analyticsRoutes from './routes/analytics.js';
import publicRoutes from './routes/public.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// Make io accessible to our routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  
  io.on('connection', (socket) => {
    socket.on('join-queue', (queueId) => {
      if (queueId) socket.join(queueId);
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`QueueFlow server running on port ${PORT} at 0.0.0.0`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
