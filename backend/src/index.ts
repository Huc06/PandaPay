import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
// import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import 'express-async-errors';

// Load environment variables
dotenv.config();

// Import configurations
import { connectDatabase } from './config/database';
// import { connectRedis } from './config/redis.config';
import { initSuiClient } from './config/sui.config';

// Import services
import { U2UContractService } from './services/u2u-contract.service';
import { socketService } from './services/socket.service';

// Import middleware
import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

// Import routes
import routes from './routes';

// Import utils
import logger from './utils/logger';
// import { setupWebSocket } from './utils/websocket';

const app: Application = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

// Create HTTP server
const server = createServer(app);

// Setup WebSocket (Old WS - Commented out, using Socket.IO instead)
// const wss = new WebSocketServer({ server, path: '/ws' });
// setupWebSocket(wss);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message:any) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (_req:any, res:any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api', routes);

// Static files
app.use('/uploads', express.static('uploads'));

// Error handling middleware (must be last)
app.use(errorMiddleware);

// 404 handler
app.use((_req:any, res:any) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ MongoDB connected');

    // Connect to Redis
    // await connectRedis();
    // logger.info('✅ Redis connected');

    // Initialize Sui client
    await initSuiClient();
    logger.info('✅ Sui client initialized');

    // Initialize U2U Contract Service
    const u2uChain = process.env.U2U_CHAIN || 'u2u';
    U2UContractService.initialize(u2uChain);
    logger.info('✅ U2U Contract Service initialized');

    // Initialize Socket.IO
    socketService.initialize(server);
    logger.info('✅ Socket.IO service initialized');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔌 Socket.IO server running on http://${HOST}:${PORT}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();