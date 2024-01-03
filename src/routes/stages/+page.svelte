<script lang="ts">
    import { Utils } from "$lib/utils"
    import Areas from "$lib/datas/stageList.json"
    import type { AreaInfo } from "$lib/types"
    import { TERRAIN_ALIAS_DICT } from "$lib/constants"
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import { mediaServerDomain } from "$lib/site.config"

    const areas = structuredClone(Areas) as AreaInfo[]

    const PAGE_DESCRIPTION = "このページでは全任務の概要を表示しています。詳細ビューへは任務のカードから移動できます。"
</script>

<svelte:head>
    <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」の任務一覧ページです。{PAGE_DESCRIPTION}" />
</svelte:head>

<HeadlineGroup pageTitle="任務一覧" pageDescription={PAGE_DESCRIPTION} />
<div id="area-index">
    <h2>
        目次
        <span id="index-annotation-desktop">（クリックして移動）</span>
        <span id="index-annotation-mobile">（タップして移動）</span>
    </h2>
    <ol>
        {#each Utils.generateNumberSequence(areas.length) as areaID}
            <li>
                <a href="#area{areaID}">Area {areaID}</a>
            </li>
        {/each}
    </ol>
</div>

<section id="areas">
    {#each areas as area}
        <h2 class="area-name">
            Area {area.areaID}
            <!--HACK: Element for offsetting anchor scroll-->
            <div class="scroll-target" id="area{area.areaID}" />
        </h2>
        <section class="stages">
            {#each area.stages as stage}
                <a class="stage" href="/stages/{stage.stageID}">
                    <div class="stage-container-top">
                        <span class="stage-id">{stage.stageID}</span>
                        <h3 class="stage-name strict-break">{stage.name}</h3>
                    </div>
                    <div class="stage-container-middle">
                        <p>主なドロップアイテム</p>
                        <div class="drop-items">
                            {#each stage.dropItems.slice(0, 4) as item}
                                <!--NOTE: Define as constant to avoid conflicts between prettier and eslint quotes rules-->
                                {@const itemName = item.replace("の設計図", "")}
                                <img class="drop-item" src="//{mediaServerDomain}/item/{itemName}.webp" alt={item} />
                            {/each}
                        </div>
                    </div>
                    <div class="stage-container-bottom">
                        <span class="overview-info" data-stage-difficulty={stage.difficulty}>{stage.difficulty}</span>
                        <span class="overview-info">推奨Lv. {stage.recommendedLevel}</span>
                        <span class="overview-info">{TERRAIN_ALIAS_DICT[stage.terrain]}</span>
                    </div>
                </a>
            {/each}
        </section>
    {/each}
</section>

<style lang="scss">
    #area-index {
        h2 {
            margin-bottom: 0.75rem;

            #index-annotation-mobile {
                display: none;
            }

            @media (max-width: 1280px) {
                #index-annotation-desktop {
                    display: none;
                }

                #index-annotation-mobile {
                    display: inline;
                }
            }
        }

        ol {
            display: flex;
            flex-wrap: wrap;

            li {
                line-height: 1.25;

                &:not(:last-of-type)::after {
                    margin-right: 0.25rem;
                    content: "/";
                }
            }
        }
    }

    #areas {
        margin: 2.5rem auto;
    }

    .area-name {
        position: relative;

        .scroll-target {
            position: absolute;
            top: calc((var(--header-height) + 2.25rem) * -1);
        }
    }

    .stages {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
        gap: 2rem;
        width: var(--body-width);
        margin: 0.5rem auto 3.75rem;

        .stage {
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background-image: var(--solid-shadow-block-background);
            border: var(--solid-shadow-block-border);

            .stage-container-top {
                display: flex;
                flex-direction: column;
                gap: 0.275rem;

                .stage-id {
                    font-size: 1rem;
                    font-feature-settings: "tnum";
                }

                .stage-name {
                    font-size: 1.5rem;
                    font-weight: 500;
                }
            }

            .stage-container-middle {
                p {
                    margin-bottom: 0.25rem;
                    font-size: 0.925rem;
                    font-weight: 500;
                    color: var(--color-medium-04);
                }

                .drop-items {
                    display: flex;
                    flex-wrap: wrap;

                    .drop-item {
                        height: 3.5rem;
                    }
                }
            }

            .stage-container-bottom {
                display: flex;
                flex-wrap: wrap;
                gap: 0.425rem;

                .overview-info {
                    padding: 0.175rem 1.25rem;
                    color: var(--color-white);
                    word-break: keep-all;
                    background-color: var(--color-student-param-misc);
                    border-radius: 9999vh;

                    &[data-stage-difficulty="NORMAL"] {
                        background-color: var(--color-stage-difficulty-green);
                    }

                    &[data-stage-difficulty="HARD"] {
                        background-color: var(--color-stage-difficulty-red);
                    }
                }
            }

            &::after {
                position: absolute;
                top: 0.575rem;
                left: 0.575rem;
                z-index: -1;
                width: 100%;
                height: 100%;
                content: "";
                background-color: var(--color-dominant);
                border: inherit;
            }

            &:hover {
                text-decoration: none;
            }
        }

        @media (max-width: 1280px) {
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        }
    }
</style>
