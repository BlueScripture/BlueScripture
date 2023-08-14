import { authorURL, siteDomain, siteRepo } from "$lib/site.config"

export function GET() {
    const resp = `Contact: https://github.com/${siteRepo}/security

Expires: 2023-12-31T23:59:59+09:00

Preferred-Languages: ja, en

Canonical: https://${siteDomain}/.well-known/security.txt

# This website is an open-source project. We are always looking for developers like you :)
Hiring: https:${authorURL}`

    return new Response(resp)
}
