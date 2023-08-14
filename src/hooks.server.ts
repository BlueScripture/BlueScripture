import { siteRepo } from "$lib/site.config"
import type { CommitLog, RawCommitLog } from "$lib/types"

export let commitLogs: CommitLog[] | null = null

async function fetchCommitLogs(): Promise<CommitLog[] | null> {
    const resp = await fetch(`https://api.github.com/repos/${siteRepo}/commits?per_page=5`)
    if (resp.ok) {
        const commitLogs: CommitLog[] = await (async (): Promise<CommitLog[]> => {
            const rawCommitLogs = (await resp.json()) as RawCommitLog[]
            const tmpArr: CommitLog[] = []
            for (const rawCommitLog of rawCommitLogs) {
                const commitDate = (function () {
                    const date = new Date(rawCommitLog.commit.author.date)
                    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
                })()
                const commitLog: CommitLog = {
                    author: rawCommitLog.commit.author.name,
                    date: commitDate,
                    message: rawCommitLog.commit.message.split("\n\n")[0],
                    url: rawCommitLog.html_url
                }
                tmpArr.push(commitLog)
            }
            return tmpArr
        })()
        return commitLogs
    } else {
        return null
    }
}

async function init() {
    commitLogs = await fetchCommitLogs()
}

void init()
