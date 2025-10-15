import { Request, Response, NextFunction } from 'express';
export declare class MerchantController {
    getPublicMerchantInfo(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    registerMerchant(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getMerchantProfile(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    updateMerchantProfile(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getMerchantPayments(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getMerchantPaymentStats(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    refundPayment(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getMerchantSettings(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    updateMerchantSettings(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getWebhooks(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    createWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    updateWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    deleteWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getApiKeys(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    createApiKey(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    deleteApiKey(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    getAllMerchants(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    updateMerchantStatus(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    updateMerchantLimits(_req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
export declare const merchantController: MerchantController;
//# sourceMappingURL=merchant.controller.d.ts.map