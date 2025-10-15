import { Request, Response, NextFunction } from 'express';
export declare class PaymentTestController {
    /**
     * Create merchant payment request (for QR code generation)
     * This is a test endpoint that doesn't require authentication
     */
    createMerchantRequest(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Get merchant request by ID
     */
    getMerchantRequest(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Update merchant request status (simulated payment completion)
     */
    updateMerchantRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
export declare const paymentTestController: PaymentTestController;
//# sourceMappingURL=payment-test.controller.d.ts.map