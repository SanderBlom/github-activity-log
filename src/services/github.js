import { getRedisClient } from '../utils/redisClient.js';

/**
 * @typedef {Object} TransformedPullRequest
 * @property {string} title - The title of the pull request.
 * @property {string} url - The HTML URL of the pull request.
 * @property {string} createdAt - The creation date of the pull request.
 * @property {string} user - The GitHub username of the pull request creator.
 * @property {string} state - The state of the pull request (e.g., open, closed).
 * @property {string} repoName - The name of the repository.
 * @property {string} orgOrUserName - The GitHub username or organization name of the repository owner.
 * @property {boolean} merged - A flag indicating whether the pull request has been merged.
 */



/**
 * Fetches all pull requests (open and closed) for a given GitHub username from Redis cache or GitHub API for the last 3 months.
 * @param {string} username - The GitHub username.
 * @returns {Promise<TransformedPullRequest[]>} A promise that resolves to an array of pull request objects.
 */
async function fetchAllPullRequests(username) {
    const client = await getRedisClient();
    const cacheKey = `allPRs:${username}`;
    const threeMonthsAgo = getThreeMonthsAgoDate();
    try {
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const url = `https://api.github.com/search/issues?q=is:pr+author:${username}+created:>=${threeMonthsAgo}`;
        const response = await fetch(url);
        const data = await response.json();
        /** @type {TransformedPullRequest} */   
        const pullRequests = await transformPRData(data.items);

        // Store the fetched data in Redis with a TTL of 12 hours
        await client.set(cacheKey, JSON.stringify(pullRequests), {
            EX: 43200
        });

        return pullRequests;
    } catch (error) {
        console.error('Error fetching data for', username, error);
        return [];
    }
}



/**
 * Filters fetched pull requests by their state (open).
 * @param {string} username - The GitHub username.
 * @returns {Promise<Array>} A promise that resolves to an array of open pull request objects.
 */
async function getOpenPullRequests(username) {
    const allPRs = await fetchAllPullRequests(username);
    return allPRs.filter(pr => pr.state === 'open');
}

/**
 * Filters fetched pull requests by their state (closed).
 * @param {string} username - The GitHub username.
 * @returns {Promise<Array>} A promise that resolves to an array of closed pull request objects.
 */
async function getClosedPullRequests(username) {
    const allPRs = await fetchAllPullRequests(username);
    return allPRs.filter(pr => pr.state === 'closed');
}

function getThreeMonthsAgoDate() {
    const date = new Date(); 
    date.setMonth(date.getMonth() - 3); // Set the month to 3 months ago
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}


/**
 * This is a generic transformation function that might be applied within both getOpenPullRequests and getClosedPullRequests
 * @param {Array} pullRequests - An array of pull request objects from the GitHub API.
 * @returns {TransformedPullRequest} A promise that resolves to an array of pull request objects, including the repository name, the organization or username, and a merged flag.
 */
async function transformPRData(pullRequests) {
    return pullRequests.map(pr => {
        // Extracting the repository name and organization/username from the repository_url
        const repoUrlParts = pr.repository_url.split('/');
        const repoName = repoUrlParts.pop(); // The last part is the repo name
        const orgOrUserName = repoUrlParts.pop(); // The second last part is the organization/username or username

        // Determining the merged status
        const merged = pr.pull_request.merged_at !== null;

        return {
            title: pr.title,
            url: pr.html_url,
            createdAt: pr.created_at,
            user: pr.user.login,
            state: pr.state,
            repoName: repoName,
            orgOrUserName: orgOrUserName,
            merged: merged
        };
    });
}

export { getOpenPullRequests, getClosedPullRequests };