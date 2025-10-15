import Redis from 'ioredis';
export declare function connectRedis(): Promise<void>;
export declare function getRedisClient(): Redis;
export declare function getCached<T>(key: string): Promise<T | null>;
export declare function setCached<T>(key: string, value: T, ttl?: number): Promise<void>;
export declare function deleteCached(key: string): Promise<void>;
//# sourceMappingURL=redis.config.d.ts.map