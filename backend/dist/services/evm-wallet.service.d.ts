import { ethers } from 'ethers';
import { EVMChainConfig } from '../config/evm.config';
export interface EVMWalletInfo {
    address: string;
    privateKey?: string;
    publicKey?: string;
}
export interface EVMBalance {
    balance: string;
    balanceInWei: string;
    symbol: string;
    decimals: number;
}
export interface EVMTransferParams {
    privateKey: string;
    toAddress: string;
    amount: string;
    chainConfig: EVMChainConfig;
    gasLimit?: string;
    gasPrice?: string;
}
export interface EVMTransferResult {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    gasUsed?: string;
    gasPrice?: string;
    totalCost?: string;
    blockNumber?: number;
    explorerUrl: string;
}
export declare class EVMWalletService {
    /**
     * Create a new EVM wallet
     */
    static createWallet(): EVMWalletInfo;
    /**
     * Import wallet from private key
     */
    static importWallet(privateKey: string): EVMWalletInfo;
    /**
     * Get provider for a specific chain
     */
    static getProvider(chainConfig: EVMChainConfig): ethers.JsonRpcProvider;
    /**
     * Get wallet balance
     */
    static getBalance(address: string, chainConfig: EVMChainConfig): Promise<EVMBalance>;
    /**
     * Get wallet transaction count (nonce)
     */
    static getTransactionCount(address: string, chainConfig: EVMChainConfig): Promise<number>;
    /**
     * Estimate gas for a transaction
     */
    static estimateGas(fromAddress: string, toAddress: string, amount: string, chainConfig: EVMChainConfig): Promise<bigint>;
    /**
     * Get current gas price
     */
    static getGasPrice(chainConfig: EVMChainConfig): Promise<bigint>;
    /**
     * Transfer native token (ETH, MATIC, BNB, etc.)
     */
    static transfer(params: EVMTransferParams): Promise<EVMTransferResult>;
    /**
     * Get transaction by hash
     */
    static getTransaction(txHash: string, chainConfig: EVMChainConfig): Promise<ethers.TransactionResponse | null>;
    /**
     * Get transaction receipt
     */
    static getTransactionReceipt(txHash: string, chainConfig: EVMChainConfig): Promise<ethers.TransactionReceipt | null>;
    /**
     * Validate EVM address
     */
    static isValidAddress(address: string): boolean;
    /**
     * Validate private key
     */
    static isValidPrivateKey(privateKey: string): boolean;
    /**
     * Get current block number
     */
    static getBlockNumber(chainConfig: EVMChainConfig): Promise<number>;
    /**
     * Get network information
     */
    static getNetwork(chainConfig: EVMChainConfig): Promise<ethers.Network>;
}
//# sourceMappingURL=evm-wallet.service.d.ts.map