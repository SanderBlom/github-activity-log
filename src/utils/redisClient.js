import {createClient} from "@redis/client";
import {getUserNames} from "./getUsernames.js";
let client;

export async function connectRedis() {
    const redisHost = process.env.REDIS_HOST || 'localhost';  // Default to localhost if REDIS_HOST is not set
    /* */
    const redisPort = process.env.REDIS_PORT || 6379;  // Default to 6379 if REDIS_PORT is not set
    console.log("Trying to connect to redis on the address: " + redisHost +" on the port: " + redisPort)
    client = await createClient({
        socket: {
            host: redisHost,
            port: redisPort,
            reconnectStrategy: (retries, cause) => {
                if (retries > 5) {
                    return new Error('Max retries reached, failing.');
                }
                return Math.min(retries * 50, 1000);
            }
        }
    });

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    await client.connect();
}

async function getRedisClient() {
    if (!client) {
        await connectRedis();
    }
    return client;
}

async function disconnectRedis() {
    if (client) {
        await client.disconnect()
        client = null
    }
}

export {getRedisClient, disconnectRedis};
