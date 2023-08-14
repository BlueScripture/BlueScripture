export function GET() {
    const disallowPaths = ((): string[] => {
        if (import.meta.env.PROD) {
            return ["/api/", "/asset/"]
        } else {
            return ["/"]
        }
    })()

    const hint = ((): string => {
        const disallowPathsStr = disallowPaths.map((path) => `Disallow: ${path}`).join("\n")
        return `User-agent: *\n${disallowPathsStr}`
    })()

    return new Response(hint)
}
