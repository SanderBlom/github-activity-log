import { getOpenPullRequests, getClosedPullRequests } from '../services/github.js'; // Adjust the path as necessary
import { getUserNames } from "../utils/getUsernames.js";
/**
 * Fetches open pull requests for a list of GitHub usernames.
 * @returns {Promise<Array<{title: string, url: string, createdAt: string, user: string, state: string, repoName: string, orgOrUserName: string}>>}>>} A promise that resolves to an array of pull request objects.
 */
async function GetOpenPRs() {
    const usernames = getUserNames();
    const promises = usernames.map(username => getOpenPullRequests(username));
    const results = await Promise.all(promises);

    const pullRequests = results.flat();

    return pullRequests;
}

/**
 * Fetches closed pull requests for a list of GitHub usernames.
 * @returns {Promise<Array<{title: string, url: string, createdAt: string, user: string, state: string, repoName: string, orgOrUserName: string}>>}>>} A promise that resolves to an array of pull request objects.
 */
async function GetClosedPRs() {
    const usernames = getUserNames();
    const promises = usernames.map(username => getClosedPullRequests(username));
    const results = await Promise.all(promises);

    const pullRequests = results.flat();

    return pullRequests;
}

/**
 * Fetches closed and open pull requests and combine the results.
 * @returns {Promise<Array<{title: string, url: string, createdAt: string, user: string, state: string, repoName: string, orgOrUserName: string}>>} A promise that resolves to an array of pull request objects.
 */
async function GetAllPRs() {

    // Fetch open and closed PRs concurrently
    const [openPRs, closedPRs] = await Promise.all([GetOpenPRs(), GetClosedPRs()]);
    const allPRs = [...openPRs, ...closedPRs];

    // Sort the combined array by the createdAt date, from newest to oldest
    allPRs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return allPRs;
}

export { GetOpenPRs, GetClosedPRs, GetAllPRs };
