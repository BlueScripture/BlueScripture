<script lang="ts">
    import { siteName, siteRepo, siteVersion, siteCodename, statusPageURL, authorURL, authorName } from "$lib/site.config"
</script>

<footer>
    <p>{siteName} Ver{siteVersion} "{siteCodename}" / Made with Love by <a rel="author" target="_blank" href={authorURL}>{authorName}</a></p>
    <p>{siteName}は非公式のファンプロジェクトです。本サイトで使用されている各種アセットの権利は原著作者に帰属します。</p>
    <ul>
        <li><a target="_blank" href="//github.com/{siteRepo}">GitHub</a></li>
        <li><a target="_blank" href={statusPageURL}>Status</a></li>
        <li><a target="_blank" href="/.well-known/security.txt">Security</a></li>
    </ul>
</footer>

<style lang="scss">
    footer {
        display: flex;
        flex-direction: column;
        gap: 0.325rem;
        align-items: center;
        padding: 1rem;
        font-size: 0.9rem;
        line-height: 1.25;
        text-align: center;
        background-color: var(--color-main-01);
        border-top: solid 0.075rem var(--color-medium-02);

        p {
            color: var(--color-medium-04);
        }

        ul {
            display: flex;

            a {
                color: var(--color-dominant);
            }

            li:not(:first-of-type)::before {
                margin: 0 0.325rem;
                content: "/";
            }
        }
    }
</style>
