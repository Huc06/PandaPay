"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedisClient = getRedisClient;
exports.getCached = getCached;
exports.setCached = setCached;
exports.deleteCached = deleteCached;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
let redisClient;
async function connectRedis() {
    try {
        redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        redisClient.on('error', (error) => {
            logger_1.default.error('Redis error:', error);
        });
        redisClient.on('connect', () => {
            logger_1.default.info('Redis connected');
        });
        await redisClient.ping();
    }
    catch (error) {
        logger_1.default.error('Failed to connect to Redis:', error);
        throw error;
    }
}
function getRedisClient() {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
}
async function getCached(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}
async function setCached(key, value, ttl) {
    const data = JSON.stringify(value);
    if (ttl) {
        await redisClient.setex(key, ttl, data);
    }
    else {
        await redisClient.set(key, data);
    }
}
async function deleteCached(key) {
    await redisClient.del(key);
}
//# sourceMappingURL=redis.config.js.map