export interface EVMChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  isTestnet: boolean;
}

export const EVM_CHAINS: Record<string, EVMChainConfig> = {
  // Ethereum Mainnet
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
  },

  // Ethereum Sepolia Testnet
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },

  // Polygon Mainnet
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    symbol: 'MATIC',
    decimals: 18,
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },

  // Polygon Mumbai Testnet
  mumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    symbol: 'MATIC',
    decimals: 18,
    explorerUrl: 'https://mumbai.polygonscan.com',
    isTestnet: true,
  },

  // Binance Smart Chain Mainnet
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    decimals: 18,
    explorerUrl: 'https://bscscan.com',
    isTestnet: false,
  },

  // BSC Testnet
  bscTestnet: {
    chainId: 97,
    name: 'BNB Smart Chain Testnet',
    rpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    symbol: 'BNB',
    decimals: 18,
    explorerUrl: 'https://testnet.bscscan.com',
    isTestnet: true,
  },

  // Arbitrum One
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false,
  },

  // Optimism
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://optimistic.etherscan.io',
    isTestnet: false,
  },

  // Avalanche C-Chain
  avalanche: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    decimals: 18,
    explorerUrl: 'https://snowtrace.io',
    isTestnet: false,
  },

  // Avalanche Fuji Testnet
  fuji: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    decimals: 18,
    explorerUrl: 'https://testnet.snowtrace.io',
    isTestnet: true,
  },

  // U2U Mainnet
  u2u: {
    chainId: 39,
    name: 'U2U Solaris Mainnet',
    rpcUrl: process.env.U2U_RPC_URL || 'https://rpc-mainnet.uniultra.xyz',
    symbol: 'U2U',
    decimals: 18,
    explorerUrl: 'https://u2uscan.xyz',
    isTestnet: false,
  },

  // U2U Testnet
  u2uTestnet: {
    chainId: 2484,
    name: 'U2U Testnet',
    rpcUrl: process.env.U2U_TESTNET_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz',
    symbol: 'U2U',
    decimals: 18,
    explorerUrl: 'https://testnet.u2uscan.xyz',
    isTestnet: true,
  },
};

export const DEFAULT_EVM_CHAIN = process.env.DEFAULT_EVM_CHAIN || 'u2uTestnet';

export function getEVMChain(chainKey: string): EVMChainConfig | undefined {
  return EVM_CHAINS[chainKey];
}

export function getAllEVMChains(): EVMChainConfig[] {
  return Object.values(EVM_CHAINS);
}

export function getTestnetChains(): EVMChainConfig[] {
  return Object.values(EVM_CHAINS).filter(chain => chain.isTestnet);
}

export function getMainnetChains(): EVMChainConfig[] {
  return Object.values(EVM_CHAINS).filter(chain => !chain.isTestnet);
}

export function getChainByChainId(chainId: number): EVMChainConfig | undefined {
  return Object.values(EVM_CHAINS).find(chain => chain.chainId === chainId);
}
