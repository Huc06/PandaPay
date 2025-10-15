"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
// import { WebSocketServer } from 'ws';
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
// Load environment variables
dotenv_1.default.config();
// Import configurations
const database_1 = require("./config/database");
// import { connectRedis } from './config/redis.config';
const sui_config_1 = require("./config/sui.config");
// Import services
const u2u_contract_service_1 = require("./services/u2u-contract.service");
const socket_service_1 = require("./services/socket.service");
// Import middleware
const cors_middleware_1 = require("./middleware/cors.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
// Import routes
const routes_1 = __importDefault(require("./routes"));
// Import utils
const logger_1 = __importDefault(require("./utils/logger"));
// import { setupWebSocket } from './utils/websocket';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Setup WebSocket (Old WS - Commented out, using Socket.IO instead)
// const wss = new WebSocketServer({ server, path: '/ws' });
// setupWebSocket(wss);
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, compression_1.default)());
app.use(cors_middleware_1.corsMiddleware);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
// Rate limiting
app.use('/api/', rateLimit_middleware_1.rateLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});
// API Routes
app.use('/api', routes_1.default);
// Static files
app.use('/uploads', express_1.default.static('uploads'));
// Error handling middleware (must be last)
app.use(error_middleware_1.errorMiddleware);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
// Start server
async function startServer() {
    try {
        // Connect to MongoDB
        await (0, database_1.connectDatabase)();
        logger_1.default.info('✅ MongoDB connected');
        // Connect to Redis
        // await connectRedis();
        // logger.info('✅ Redis connected');
        // Initialize Sui client
        await (0, sui_config_1.initSuiClient)();
        logger_1.default.info('✅ Sui client initialized');
        // Initialize U2U Contract Service
        const u2uChain = process.env.U2U_CHAIN || 'u2u';
        u2u_contract_service_1.U2UContractService.initialize(u2uChain);
        logger_1.default.info('✅ U2U Contract Service initialized');
        // Initialize Socket.IO
        socket_service_1.socketService.initialize(server);
        logger_1.default.info('✅ Socket.IO service initialized');
        // Start server
        server.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on http://${HOST}:${PORT}`);
            logger_1.default.info(`📝 Environment: ${process.env.NODE_ENV}`);
            logger_1.default.info(`🔌 Socket.IO server running on http://${HOST}:${PORT}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger_1.default.error('Unhandled Rejection:', error);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.default.info('Server closed');
        process.exit(0);
    });
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map