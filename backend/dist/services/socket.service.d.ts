import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
export declare class SocketService {
    private io;
    private connectedClients;
    initialize(httpServer: HTTPServer): void;
    getIO(): Server | null;
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
    }): void;
    emitToSocket(socketId: string, event: string, data: any): void;
    broadcast(event: string, data: any): void;
    getConnectedClientsCount(): number;
}
export declare const socketService: SocketService;
//# sourceMappingURL=socket.service.d.ts.map