<script lang="ts">
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"

    type ToolInfo = {
        name: string
        description: string
        path: string
    }

    const tools: ToolInfo[] = [
        {
            name: "編成画像メーカー",
            description: "フォームに部隊の情報を入力することでSNS等で共有可能な部隊編成の画像を作成できるツールです。",
            path: "unit-image-maker"
        }
    ]

    const PAGE_DESCRIPTION = "各種ツールの一覧ページです。ツール名のリンクから各ツールのページに移動できます。"
</script>

<svelte:head>
    <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」の攻略をサポートする{PAGE_DESCRIPTION}" />
</svelte:head>

<HeadlineGroup pageTitle="ツール集" pageDescription={PAGE_DESCRIPTION} />
<ul id="tools">
    {#each tools as tool}
        <li class="tool">
            <hgroup class="tool-name">
                <a href="/tools/{tool.path}">
                    <h2>{tool.name}</h2>
                </a>
                <p class="path">/{tool.path}</p>
            </hgroup>
            <p class="tool-description sentence">{tool.description}</p>
        </li>
    {/each}
</ul>

<style lang="scss">
    #tools {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        list-style: none;

        .tool {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .tool-name {
                display: flex;
                align-items: center;

                h2 {
                    margin-right: 1.5rem;
                }

                .path {
                    font-size: 0.925rem;
                    color: var(--color-medium-04);

                    @media (max-width: 1280px) {
                        display: none;
                    }
                }

                &::before {
                    margin-right: 0.5rem;
                    font-size: 1.5rem;
                    color: var(--color-dominant);
                    content: "-";
                }

                &:hover {
                    h2 {
                        text-decoration: underline;

                        &::before {
                            text-decoration: none;
                        }
                    }
                }
            }

            .tool-description {
                margin-left: 1.25rem;
            }
        }
    }
</style>
