const github = require("@actions/github");
const core = require("@actions/core");

const repositories = ["redis-in-action", "github-actions-in-action"]

async function run() {
    try {
        const owner = github.context.repo.owner;
        const token = core.getInput("REVIEW_REMIND_TOKEN");
        const webHookUrl = core.getInput("WEBHOOK_URL");
        const octokit = github.getOctokit(token);
        repositories.map(async (repository) => {
            const {data: pullRequests} = await octokit.rest.pulls.list({
                owner,
                repository,
                state: "open",
                per_page: 100,
                sort: "updated",
                direction: "desc"
            });
            const messages = await getMessages(pullRequests);
            await sendMessage(webHookUrl, messages);
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getMessages(pullRequests) {
    return pullRequests.map((pr) => {
        const {title, html_url, user: {login}, created_at} = pr
        const elapsedDate = new Date() - new Date(created_at)
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `제목: <${html_url}|${title}>\nPR 생성자: ${login}\n리뷰하러 가기: <${html_url}|바로가기>\n경과시간: ${Math.floor(elapsedDate / (1000 * 60 * 60 * 24))}일 전에 생성됨.\n\n`
            }
        };
    });
}

async function sendMessage(webHookUrl, messages) {
    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "리뷰 부탁드립니다."
            }
        },
        ...messages
    ];
    const message = {
        "blocks": blocks
    };
    console.log(`send messages: ${message}`)
}

run().then(r => console.log(r)).catch(e => core.setFailed(e));
