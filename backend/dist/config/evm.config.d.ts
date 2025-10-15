export interface EVMChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    symbol: string;
    decimals: number;
    explorerUrl: string;
    isTestnet: boolean;
}
export declare const EVM_CHAINS: Record<string, EVMChainConfig>;
export declare const DEFAULT_EVM_CHAIN: string;
export declare function getEVMChain(chainKey: string): EVMChainConfig | undefined;
export declare function getAllEVMChains(): EVMChainConfig[];
export declare function getTestnetChains(): EVMChainConfig[];
export declare function getMainnetChains(): EVMChainConfig[];
export declare function getChainByChainId(chainId: number): EVMChainConfig | undefined;
//# sourceMappingURL=evm.config.d.ts.map