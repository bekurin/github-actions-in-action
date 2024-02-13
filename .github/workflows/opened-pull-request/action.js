const github = require("@actions/github")
const core = require("@actions/core")

try {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;

    const githubClient = github.getOctokit(process.env.GITHUB_TOKEN);
    const {data: pullRequests} = githubClient.rest.pulls.list({
        owner,
        repo,
        state: "open",
        per_page: 100,
        sort: "updated",
        direction: "desc"
    });
    console.log(pullRequests)
} catch (error) {
    core.setFailed(error.message)
}
