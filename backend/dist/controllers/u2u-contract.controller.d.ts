import { Request, Response } from 'express';
export declare class U2UContractController {
    /**
     * Register a new merchant
     * POST /api/u2u-contract/merchant/register
     */
    static registerMerchant(req: Request, res: Response): Promise<any>;
    /**
     * Create a payment
     * POST /api/u2u-contract/payment/create
     */
    static createPayment(req: Request, res: Response): Promise<any>;
    /**
     * Confirm a payment
     * POST /api/u2u-contract/payment/confirm
     */
    static confirmPayment(req: Request, res: Response): Promise<any>;
    /**
     * Refund a payment
     * POST /api/u2u-contract/payment/refund
     */
    static refundPayment(req: Request, res: Response): Promise<any>;
    /**
     * Get merchant information
     * GET /api/u2u-contract/merchant/:address
     */
    static getMerchantInfo(req: Request, res: Response): Promise<any>;
    /**
     * Get transaction details
     * GET /api/u2u-contract/transaction/:id
     */
    static getTransactionDetails(req: Request, res: Response): Promise<any>;
    /**
     * Get merchant transactions
     * GET /api/u2u-contract/merchant/:address/transactions
     */
    static getMerchantTransactions(req: Request, res: Response): Promise<any>;
    /**
     * Get user transactions
     * GET /api/u2u-contract/user/:address/transactions
     */
    static getUserTransactions(req: Request, res: Response): Promise<any>;
    /**
     * Get platform statistics
     * GET /api/u2u-contract/stats
     */
    static getPlatformStats(_req: Request, res: Response): Promise<any>;
    /**
     * Deactivate merchant (admin only)
     * POST /api/u2u-contract/merchant/:address/deactivate
     */
    static deactivateMerchant(req: Request, res: Response): Promise<any>;
    /**
     * Update platform fee (admin only)
     * POST /api/u2u-contract/platform/fee
     */
    static updatePlatformFee(req: Request, res: Response): Promise<any>;
    /**
     * Get contract information
     * GET /api/u2u-contract/info
     */
    static getContractInfo(_req: Request, res: Response): Promise<any>;
    /**
     * Create payment for authenticated user (using stored private key)
     * POST /api/u2u-contract/payment/create-for-user
     */
    static createPaymentForUser(req: Request, res: Response): Promise<any>;
    /**
     * Confirm payment for authenticated merchant (using stored private key)
     * POST /api/u2u-contract/payment/confirm-for-merchant
     */
    static confirmPaymentForMerchant(req: Request, res: Response): Promise<any>;
    /**
     * Register merchant for authenticated user (using stored private key)
     * POST /api/u2u-contract/merchant/register-for-user
     */
    static registerMerchantForUser(req: Request, res: Response): Promise<any>;
}
//# sourceMappingURL=u2u-contract.controller.d.ts.map