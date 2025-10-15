"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("../utils/logger"));
class SocketService {
    io = null;
    connectedClients = new Map();
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });
        this.io.on('connection', (socket) => {
            logger_1.default.info(`Socket connected: ${socket.id}`);
            this.connectedClients.set(socket.id, socket);
            // Handle QR room events
            socket.on('join-qr-room', (requestId) => {
                logger_1.default.info(`Socket ${socket.id} joining QR room: ${requestId}`);
                socket.join(`qr:${requestId}`);
            });
            socket.on('leave-qr-room', (requestId) => {
                logger_1.default.info(`Socket ${socket.id} leaving QR room: ${requestId}`);
                socket.leave(`qr:${requestId}`);
            });
            socket.on('disconnect', () => {
                logger_1.default.info(`Socket disconnected: ${socket.id}`);
                this.connectedClients.delete(socket.id);
            });
        });
        logger_1.default.info('✅ Socket.IO server initialized');
    }
    getIO() {
        return this.io;
    }
    // Emit QR payment status updates
    emitQRStatusUpdate(requestId, data) {
        if (!this.io) {
            logger_1.default.warn('Socket.IO not initialized');
            return;
        }
        const payload = {
            requestId,
            ...data,
        };
        logger_1.default.info(`Emitting QR status update for request ${requestId}:`, payload.status);
        this.io.to(`qr:${requestId}`).emit('qr:status-update', payload);
    }
    // Emit to specific socket
    emitToSocket(socketId, event, data) {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
            socket.emit(event, data);
        }
    }
    // Broadcast to all clients
    broadcast(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
    // Get connected clients count
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
}
exports.SocketService = SocketService;
exports.socketService = new SocketService();
//# sourceMappingURL=socket.service.js.map