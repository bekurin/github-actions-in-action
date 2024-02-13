const github = require("@actions/github")
const core = require("@actions/core")

async function run() {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const token = core.getInput("REVIEW_REMIND_TOKEN")

    const octokit = github.getOctokit(token)
    const {data: pullRequests} = await octokit.rest.pulls.list({
        owner,
        repo,
        state: "open",
        per_page: 100,
        sort: "updated",
        direction: "desc"
    });
    console.log(`owner: ${owner}, repo: ${repo}, octokit: ${octokit}`)
    pullRequests.flatMap(value => {
        console.log(`url: ${value.html_url}, title: ${value.title}`)
    })
}

run();
