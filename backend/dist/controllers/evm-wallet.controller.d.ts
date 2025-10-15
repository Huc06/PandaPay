import { Request, Response, NextFunction } from 'express';
export declare class EVMWalletController {
    /**
     * Get all available EVM chains
     */
    getChains(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Create a new EVM wallet for user
     */
    createWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Get EVM wallet balance
     */
    getBalance(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Transfer native token (ETH, MATIC, BNB, etc.)
     */
    transfer(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Import EVM wallet from private key
     */
    importWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Export EVM wallet (private key)
     */
    exportWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Get EVM wallet info
     */
    getWalletInfo(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Get gas estimate for transfer
     */
    estimateGas(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
    /**
     * Get transaction by hash
     */
    getTransaction(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
export declare const evmWalletController: EVMWalletController;
//# sourceMappingURL=evm-wallet.controller.d.ts.map