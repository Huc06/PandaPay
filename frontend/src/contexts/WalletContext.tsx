'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Wallet } from '@/types';
import { getEVMWalletBalanceAPI } from '@/lib/api-client';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWallet();
    } else {
      // Clear wallet when user logs out
      setWallet(null);
    }
  }, [user]);

  const loadWallet = async () => {
    try {
      // Load wallet from user profile
      await refreshBalance();
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const refreshBalance = async () => {
    // Don't try to refresh if user is not authenticated
    if (!user || !user.evmWalletAddress) {
      console.log('No authenticated user or EVM wallet, skipping balance refresh');
      return;
    }

    setLoading(true);
    try {
      const response = await getEVMWalletBalanceAPI('u2uTestnet');
      if (response.success) {
        setWallet({
          address: user.evmWalletAddress,
          balance: parseFloat(response.balance),
          tokens: [{
            symbol: 'U2U',
            name: 'U2U Token',
            balance: parseFloat(response.balance)
          }]
        });
      }
    } catch (error: any) {
      // Only log non-auth errors
      if (error.response?.status !== 401) {
        console.error('Failed to refresh balance:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{ wallet, loading, refreshBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
}