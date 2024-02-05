import { getRedisClient } from './redisClient.js';

/**
 * Validates that all required environment variables are set.
 * If any are missing, logs an error and exits the application.
 */
export function validateEnv() {
    const requiredEnv = [
        'REDIS_HOST',
        'REDIS_PORT',
        'USERNAMES',
    ];

    const missingEnv = requiredEnv.filter(envName => !process.env[envName]);
    if (missingEnv.length > 0) {
        console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
        process.exit(1); // Exit the application with an error code
    }
}

/**
 * Validates that we can access the Redis server.
 */
export async function checkRedisLiveliness() {
    const client = getRedisClient();
    await client.set('livelinessProbe', 'ok');
    const value = await client.get('livelinessProbe');
    await client.disconnect();
    return value === 'ok';

}