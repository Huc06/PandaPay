"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentTestController = exports.PaymentTestController = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
const socket_service_1 = require("../services/socket.service");
class PaymentTestController {
    /**
     * Create merchant payment request (for QR code generation)
     * This is a test endpoint that doesn't require authentication
     */
    async createMerchantRequest(req, res, next) {
        try {
            const { amount, description } = req.body;
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid amount is required',
                });
            }
            // Generate unique request ID
            const requestId = `REQ_${Date.now()}_${(0, uuid_1.v4)().slice(0, 8)}`;
            // Generate test merchant ID (in real app, get from authenticated user)
            const merchantId = `MCH_TEST_${(0, uuid_1.v4)().slice(0, 8)}`;
            // Create QR payload
            const qrPayload = {
                requestId,
                amount: parseFloat(amount),
                merchantId,
                currency: 'U2U',
                description: description || undefined,
            };
            // Create merchant request object
            const merchantRequest = {
                id: requestId,
                amount: parseFloat(amount),
                status: 'pending',
                qrPayload,
                createdAt: new Date().toISOString(),
            };
            logger_1.default.info(`Created merchant payment request: ${requestId}`);
            // Emit socket event for QR status
            socket_service_1.socketService.emitQRStatusUpdate(requestId, {
                status: 'created',
                timestamp: new Date().toISOString(),
                amount: parseFloat(amount),
                merchantId,
            });
            return res.json({
                success: true,
                request: merchantRequest,
            });
        }
        catch (error) {
            logger_1.default.error('Create merchant request error:', error);
            next(error);
        }
    }
    /**
     * Get merchant request by ID
     */
    async getMerchantRequest(req, res, next) {
        try {
            const { requestId } = req.params;
            // In a real app, fetch from database
            // For now, return mock data
            return res.json({
                success: true,
                request: {
                    id: requestId,
                    status: 'pending',
                    amount: 0,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get merchant request error:', error);
            next(error);
        }
    }
    /**
     * Update merchant request status (simulated payment completion)
     */
    async updateMerchantRequestStatus(req, res, next) {
        try {
            const { requestId } = req.params;
            const { status, txHash } = req.body;
            logger_1.default.info(`Updating merchant request ${requestId} to status: ${status}`);
            // Emit socket event
            socket_service_1.socketService.emitQRStatusUpdate(requestId, {
                status,
                timestamp: new Date().toISOString(),
                txHash,
                completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            });
            return res.json({
                success: true,
                message: 'Status updated',
            });
        }
        catch (error) {
            logger_1.default.error('Update merchant request status error:', error);
            next(error);
        }
    }
}
exports.PaymentTestController = PaymentTestController;
exports.paymentTestController = new PaymentTestController();
//# sourceMappingURL=payment-test.controller.js.map