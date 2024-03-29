import {createClient} from "@redis/client";
import {getUserNames} from "./getUsernames.js";
let client;

export async function connectRedis() {
    const redisHost = process.env.REDIS_HOST || 'localhost'; 
    const redisPort = process.env.REDIS_PORT || 6379;  
    const redisPassword = process.env.REDIS_PASSWORD;

    console.log("Trying to connect to Redis on the address: " + redisHost + " on the port: " + redisPort);

    const connectionOptions = {
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
    };

    // If a password is provided, add it to the connection options
    if (redisPassword) {
        connectionOptions.password = redisPassword;
    }

    client = await createClient(connectionOptions);

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
