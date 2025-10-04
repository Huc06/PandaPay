import { ethers } from 'ethers';
import { EVMChainConfig } from '../config/evm.config';
import logger from '../utils/logger';

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

export class EVMWalletService {
  /**
   * Create a new EVM wallet
   */
  static createWallet(): EVMWalletInfo {
    const wallet = ethers.Wallet.createRandom();

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
    };
  }

  /**
   * Import wallet from private key
   */
  static importWallet(privateKey: string): EVMWalletInfo {
    try {
      const wallet = new ethers.Wallet(privateKey);

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.signingKey.publicKey,
      };
    } catch (error) {
      logger.error('Failed to import EVM wallet:', error);
      throw new Error('Invalid private key format');
    }
  }

  /**
   * Get provider for a specific chain
   */
  static getProvider(chainConfig: EVMChainConfig): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(chainConfig.rpcUrl);
  }

  /**
   * Get wallet balance
   */
  static async getBalance(
    address: string,
    chainConfig: EVMChainConfig
  ): Promise<EVMBalance> {
    try {
      const provider = this.getProvider(chainConfig);
      const balanceInWei = await provider.getBalance(address);
      const balance = ethers.formatUnits(balanceInWei, chainConfig.decimals);

      return {
        balance,
        balanceInWei: balanceInWei.toString(),
        symbol: chainConfig.symbol,
        decimals: chainConfig.decimals,
      };
    } catch (error) {
      logger.error('Failed to get EVM balance:', { address, chain: chainConfig.name, error });
      throw new Error('Failed to fetch balance');
    }
  }

  /**
   * Get wallet transaction count (nonce)
   */
  static async getTransactionCount(
    address: string,
    chainConfig: EVMChainConfig
  ): Promise<number> {
    try {
      const provider = this.getProvider(chainConfig);
      return await provider.getTransactionCount(address);
    } catch (error) {
      logger.error('Failed to get transaction count:', { address, chain: chainConfig.name, error });
      throw new Error('Failed to fetch transaction count');
    }
  }

  /**
   * Estimate gas for a transaction
   */
  static async estimateGas(
    fromAddress: string,
    toAddress: string,
    amount: string,
    chainConfig: EVMChainConfig
  ): Promise<bigint> {
    try {
      const provider = this.getProvider(chainConfig);
      const amountInWei = ethers.parseUnits(amount, chainConfig.decimals);

      const gasEstimate = await provider.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: amountInWei,
      });

      return gasEstimate;
    } catch (error) {
      logger.error('Failed to estimate gas:', { fromAddress, toAddress, amount, error });
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * Get current gas price
   */
  static async getGasPrice(chainConfig: EVMChainConfig): Promise<bigint> {
    try {
      const provider = this.getProvider(chainConfig);
      const feeData = await provider.getFeeData();

      return feeData.gasPrice || BigInt(0);
    } catch (error) {
      logger.error('Failed to get gas price:', { chain: chainConfig.name, error });
      throw new Error('Failed to fetch gas price');
    }
  }

  /**
   * Transfer native token (ETH, MATIC, BNB, etc.)
   */
  static async transfer(params: EVMTransferParams): Promise<EVMTransferResult> {
    try {
      const { privateKey, toAddress, amount, chainConfig, gasLimit, gasPrice } = params;

      const provider = this.getProvider(chainConfig);
      const wallet = new ethers.Wallet(privateKey, provider);

      // Convert amount to Wei
      const amountInWei = ethers.parseUnits(amount, chainConfig.decimals);

      // Prepare transaction
      const txRequest: ethers.TransactionRequest = {
        to: toAddress,
        value: amountInWei,
      };

      // Set gas limit if provided
      if (gasLimit) {
        txRequest.gasLimit = BigInt(gasLimit);
      }

      // Set gas price if provided
      if (gasPrice) {
        txRequest.gasPrice = BigInt(gasPrice);
      }

      logger.info('Sending EVM transaction:', {
        from: wallet.address,
        to: toAddress,
        amount,
        chain: chainConfig.name,
      });

      // Send transaction
      const tx = await wallet.sendTransaction(txRequest);

      logger.info('Transaction sent, waiting for confirmation:', {
        txHash: tx.hash,
        chain: chainConfig.name,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      const gasUsed = receipt.gasUsed.toString();
      const effectiveGasPrice = receipt.gasPrice.toString();
      const totalGasCost = receipt.gasUsed * receipt.gasPrice;
      const totalCost = ethers.formatUnits(
        amountInWei + totalGasCost,
        chainConfig.decimals
      );

      logger.info('Transaction confirmed:', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed,
        chain: chainConfig.name,
      });

      return {
        txHash: receipt.hash,
        from: receipt.from,
        to: receipt.to || toAddress,
        amount,
        gasUsed,
        gasPrice: effectiveGasPrice,
        totalCost,
        blockNumber: receipt.blockNumber,
        explorerUrl: `${chainConfig.explorerUrl}/tx/${receipt.hash}`,
      };
    } catch (error) {
      logger.error('EVM transfer failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });

      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient balance for transfer');
        }
        if (error.message.includes('nonce')) {
          throw new Error('Transaction nonce error. Please try again.');
        }
        if (error.message.includes('gas')) {
          throw new Error('Gas estimation failed. Please adjust gas parameters.');
        }
      }

      throw new Error('Transfer failed');
    }
  }

  /**
   * Get transaction by hash
   */
  static async getTransaction(
    txHash: string,
    chainConfig: EVMChainConfig
  ): Promise<ethers.TransactionResponse | null> {
    try {
      const provider = this.getProvider(chainConfig);
      return await provider.getTransaction(txHash);
    } catch (error) {
      logger.error('Failed to get transaction:', { txHash, chain: chainConfig.name, error });
      return null;
    }
  }

  /**
   * Get transaction receipt
   */
  static async getTransactionReceipt(
    txHash: string,
    chainConfig: EVMChainConfig
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = this.getProvider(chainConfig);
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error('Failed to get transaction receipt:', { txHash, chain: chainConfig.name, error });
      return null;
    }
  }

  /**
   * Validate EVM address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Validate private key
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current block number
   */
  static async getBlockNumber(chainConfig: EVMChainConfig): Promise<number> {
    try {
      const provider = this.getProvider(chainConfig);
      return await provider.getBlockNumber();
    } catch (error) {
      logger.error('Failed to get block number:', { chain: chainConfig.name, error });
      throw new Error('Failed to fetch block number');
    }
  }

  /**
   * Get network information
   */
  static async getNetwork(chainConfig: EVMChainConfig): Promise<ethers.Network> {
    try {
      const provider = this.getProvider(chainConfig);
      return await provider.getNetwork();
    } catch (error) {
      logger.error('Failed to get network info:', { chain: chainConfig.name, error });
      throw new Error('Failed to fetch network information');
    }
  }
}
