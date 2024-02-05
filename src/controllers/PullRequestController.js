import { getOpenPullRequests, getClosedPullRequests } from '../services/github.js'; // Adjust the path as necessary
import { getUserNames } from "../utils/getUsernames.js";
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
 * Fetches open pull requests for a list of GitHub usernames.
 * @returns {Promise<TransformedPullRequest>} A promise that resolves to an array of pull request objects.
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
 * @returns {Promise<TransformedPullRequest>}} A promise that resolves to an array of pull request objects.
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
 * @returns {Promise<TransformedPullRequest>} A promise that resolves to an array of pull request objects.
 */
async function GetAllPRs() {

    // Fetch open and closed PRs concurrently
    const [openPRs, closedPRs] = await Promise.all([GetOpenPRs(), GetClosedPRs()]);
    const allPRs = [...openPRs, ...closedPRs];

    // Sort the combined array by the createdAt date, from newest to oldest
    allPRs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return allPRs;
}


/**
 * Returns a styled HTML string of open and closed pull requests for a list of GitHub usernames. 
 * This can be used as an example on how to display the data on a web page.
 */
async function GetAllHTMLExample() {
    const data = await GetAllPRs();
    if (data.length === 0) {
        return null;
    }

    let htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your org feed</title>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
        <!-- Style credits: https://codepen.io/JulienMelissas/pen/xbZdmz -->
        <style>
        html {
            box-sizing: border-box;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
            color: #4e555f;
            font-size: 14px;
        }
        
        a {
            color: #50bced; /* Blue */
        }
        
        .activity-feed {
            padding: 15px;
            list-style: none;
        }
        
        .feed-item {
            position: relative;
            padding-bottom: 20px;
            padding-left: 30px;
            border-left: 2px solid #e4e8eb;
        }
        
        .feed-item:last-child {
            border-color: transparent;
        }
        
        .feed-item::after {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            left: -6px;
            width: 10px;
            height: 10px;
            border-radius: 6px;
            background: #fff;
        }
        
        /* Open PRs */
        .feed-item.open::after {
            border: 1px solid #28a745; /* Green for open PRs */
        }
        .feed-item.open {
            border-left: 2px solid #28a745; /* Green border for open PRs */
        }
        
        /* Closed PRs */
        .feed-item.closed::after {
            border: 1px solid #cb2431; /* Red for closed PRs */
        }
        .feed-item.closed {
            border-left: 2px solid #cb2431; /* Red border for closed PRs */
            color: #8c96a3; /* Dimmed text for closed PRs */
        }
        
        /* Merged PRs */
        .feed-item.merged::after {
            border: 1px solid #6f42c1; /* Purple for merged PRs */
        }
        .feed-item.merged {
            border-left: 2px solid #6f42c1; /* Purple border for merged PRs */
        }
        .date {
            display: block;
            position: relative;
            top: -5px;
            color: #8c96a3;
            text-transform: uppercase;
            font-size: 13px;
        }
        
        .text {
            position: relative;
            top: -3px;
        }
        </style>
        
    </head>
    <body>
        <h2>Activity Feed</h2>
        <ol class="activity-feed">`;

        data.forEach(pr => {
            const date = new Date(pr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            let itemClass = ''; // Default class
            let actionText = 'opened'; // Default action text

            if (pr.state === 'open') {
                itemClass = 'open';
            } else if (pr.state === 'closed' && pr.merged) {
                itemClass = 'merged';
                actionText = 'merged';
            } else if (pr.state === 'closed' && !pr.merged) {
                return; // Skip this PR
            }
        
            htmlResponse += `
                <li class="feed-item ${itemClass}">
                    <time class="date" datetime="${pr.createdAt}">${date}</time>
                    <span class="text">${pr.user} ${actionText} a pull request <a href="${pr.url}">${pr.title}</a> at ${pr.orgOrUserName}/${pr.repoName}</span>
                </li>`;
        });

    htmlResponse += `
        </ol>
    </body>
    </html>`;

    return htmlResponse;
}
export { GetOpenPRs, GetClosedPRs, GetAllPRs, GetAllHTMLExample };
