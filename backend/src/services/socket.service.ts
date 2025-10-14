import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';

export class SocketService {
  private io: Server | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  initialize(httpServer: HTTPServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Handle QR room events
      socket.on('join-qr-room', (requestId: string) => {
        logger.info(`Socket ${socket.id} joining QR room: ${requestId}`);
        socket.join(`qr:${requestId}`);
      });

      socket.on('leave-qr-room', (requestId: string) => {
        logger.info(`Socket ${socket.id} leaving QR room: ${requestId}`);
        socket.leave(`qr:${requestId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });

    logger.info('✅ Socket.IO server initialized');
  }

  getIO(): Server | null {
    return this.io;
  }

  // Emit QR payment status updates
  emitQRStatusUpdate(requestId: string, data: {
    status: 'created' | 'scanned' | 'processing' | 'completed' | 'failed';
    timestamp: string;
    transactionId?: string;
    txHash?: string;
    amount?: number;
    gasFee?: number;
    totalAmount?: number;
    merchantId?: string;
    explorerUrl?: string;
    completedAt?: string;
    scannedAt?: string;
    userInfo?: {
      cardLast4: string;
    };
    error?: string;
  }): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      requestId,
      ...data,
    };

    logger.info(`Emitting QR status update for request ${requestId}:`, payload.status);
    this.io.to(`qr:${requestId}`).emit('qr:status-update', payload);
  }

  // Emit to specific socket
  emitToSocket(socketId: string, event: string, data: any): void {
    const socket = this.connectedClients.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Broadcast to all clients
  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

export const socketService = new SocketService();
