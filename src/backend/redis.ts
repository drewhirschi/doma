import Redis from 'ioredis';

class RedisSingleton {
    private static instance: Redis | null = null;

    private constructor() { }


    public static getInstance(): Redis {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new Redis({
                
                host: process.env.UPSTASH_REDIS_HOST!,
                port: 6379,
                password: process.env.UPSTASH_REDIS_PWD!,
                // tls: {},
                maxRetriesPerRequest: null,
            });
            // RedisSingleton.instance = new Redis(process.env.REDIS_URL!, {
            //     maxRetriesPerRequest: null,
            // });

            RedisSingleton.instance.on('connect', () => {
                console.log('Redis connected');
            });
            RedisSingleton.instance.on('error', (err) => {
                console.error('Redis connection error:', err);
            });
        }

        return RedisSingleton.instance;
    }
}

export default RedisSingleton;
