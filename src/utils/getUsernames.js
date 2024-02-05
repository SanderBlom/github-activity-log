/**
 * Gets the usernames that we should search for in the GitHub API.
 * @returns {string[]} with the usernames from the environment variable.
 */
function getUserNames() {

    // Read the usernames from an environment variable; split into an array
    const usernames = process.env.USERNAMES ? process.env.USERNAMES.split(',') : [];

    if (usernames.length === 0) {
        throw new Error("No usernames has been defined");
    }
    return usernames;
}

export {getUserNames};