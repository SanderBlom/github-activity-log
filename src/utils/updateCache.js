import cron from 'node-cron';
import { getRedisClient } from './redisClient.js';
import { getOpenPullRequests, getClosedPullRequests } from '../services/github.js'; // Adjust the import path as necessary
import { getUserNames } from "./getUsernames.js";


/**
 * Updates the Redis cache with the latest open and closed pull requests for a list of GitHub usernames.
 * This function fetches both open and closed pull requests for each username concurrently,
 * then caches the results in Redis with a set expiration time.
 * 
 * @async
 * @function updatePRsInCache
 * @returns {Promise<void>} A promise that resolves when the caching process is complete for all usernames.
 * @throws {Error} Throws an error if the fetching or caching process fails.
 */
async function updatePRsInCache() {
    const usernames = getUserNames();

    try {
        for (const username of usernames) {
            const [openPRs, closedPRs] = await Promise.all([
                getOpenPullRequests(username),
                getClosedPullRequests(username),
            ]);
            const client = getRedisClient();    
            // Cache the results with appropriate keys
            await client.set(`openPRs:${username}`, JSON.stringify(openPRs), { EX: 7200 });
            await client.set(`closedPRs:${username}`, JSON.stringify(closedPRs), { EX: 7200 });
        }
        console.log('Pull requests cache updated.');
    } catch (error) {
        console.error('Failed to update PRs in cache:', error);
    }
}

/**
 * Starts a cron job that updates the Redis cache with the latest pull requests every two hours.
 * The job runs at the start of every second hour, invoking `updatePRsInCache` to fetch and cache
 * the latest open and closed pull requests for a predefined list of GitHub usernames.
 */

function startCronJob() {
    cron.schedule('0 */2 * * *', () => {
        console.log('Running cron job to update PRs in cache');
        updatePRsInCache();
    });

    console.log('Cron job scheduled to update PRs every 2 hours.');
}

export { startCronJob };
