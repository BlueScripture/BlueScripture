<script lang="ts">
    import { TERRAIN_ALIAS_DICT } from "$lib/constants"
    import { mediaServerDomain } from "$lib/site.config"
    import type { StageInfo } from "$lib/types"

    export let data: {
        stageInfo: StageInfo
    }

    const DATA_LABEL_NAMES = [
        {
            id: "name",
            name: "ステージ"
        },
        {
            id: "difficulty",
            name: "難易度"
        },
        {
            id: "terrain",
            name: "地形"
        },
        {
            id: "recommendedLevel",
            name: "推奨Lv."
        },
        {
            id: "challengeRequiredTurns",
            name: "チャレンジ達成に必要なターン数"
        }
    ] as const
</script>

<svelte:head>
    <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」の任務{data.stageInfo.stageID}（{data.stageInfo.name}）の詳細ページ" />
</svelte:head>

<h1 class="visually-hidden">任務詳細ビュー：{data.stageInfo.stageID}</h1>

<section id="stage-detail-container">
    <div id="stage-details">
        <section class="stage-detail">
            <h2>ステージ概要</h2>
            <ul class="stage-detail-list">
                {#each DATA_LABEL_NAMES as dataLabelName}
                    <li class="list-element">
                        <span class="list-label">{dataLabelName.name}</span>
                        <span class="list-value">
                            {#if dataLabelName.id == "terrain"}
                                {TERRAIN_ALIAS_DICT[data.stageInfo[dataLabelName.id]]}
                            {:else}
                                {data.stageInfo[dataLabelName.id]}
                            {/if}
                        </span>
                    </li>
                {/each}
            </ul>
        </section>
        <section class="stage-detail">
            <h2>ドロップするアイテム</h2>
            <ul class="stage-drop-items">
                {#each data.stageInfo.dropItems as item}
                    {@const itemLink = item.category == "装備の設計図" ? `/items/${item.parentEquipment}` : `/items/${item.name}`}
                    <li class="item">
                        <a href={itemLink} class="item-container">
                            <img class="item-icon" src="//{mediaServerDomain}/item/{item.name}.webp" alt={item.name} />
                            <div class="item-info">
                                <span class="item-category">
                                    {#if item.category == "装備品"}
                                        {item.equipmentCategory}・T{item.tier}
                                    {:else}
                                        {item.category}
                                    {/if}
                                </span>
                                <h3 class="item-name">{item.name}</h3>
                            </div>
                        </a>
                    </li>
                {/each}
            </ul>
        </section>
    </div>
    <!--TODO: Implement 3D map viewer-->
</section>

<style lang="scss">
    :root {
        --dashed-border: dashed 0.075rem var(--color-medium-04);
    }

    #stage-detail-container {
        display: flex;
        justify-content: center;

        #stage-details {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
            width: 75%;

            .stage-detail {
                position: relative;
                box-sizing: border-box;
                padding: 1rem 1.5rem 1.25rem;
                background: var(--solid-shadow-block-background);
                border: var(--solid-shadow-block-border);

                h2 {
                    padding-bottom: 1rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    text-align: center;
                    border-bottom: solid 0.075rem var(--color-medium-04);
                }

                .stage-detail-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    padding: 0 0.5rem;
                    margin-top: 0.175rem;
                    list-style: none;

                    .list-element {
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 47.5%;
                        padding: 0.5rem 0.625rem;
                        border-bottom: var(--dashed-border);

                        .list-label {
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                        }

                        .list-value {
                            text-align: right;
                        }
                    }
                }

                .stage-drop-items {
                    display: flex;
                    flex-direction: column;
                    padding: 0 0.625rem;

                    .item {
                        padding: 0.5rem;
                        border-bottom: var(--dashed-border);

                        .item-container {
                            display: flex;
                            gap: 0.75rem;
                            align-items: center;
                            width: fit-content;

                            .item-icon {
                                width: auto;
                                height: 3.75rem;
                            }

                            .item-info {
                                .item-category {
                                    font-size: 0.925rem;
                                    color: var(--color-medium-04);
                                }

                                h3 {
                                    margin-top: 0.325rem;
                                }
                            }
                        }
                    }
                }

                &::after {
                    position: absolute;
                    top: 0.65rem;
                    left: 0.65rem;
                    z-index: -1;
                    width: 100%;
                    height: 100%;
                    content: "";
                    background: var(--color-dominant);
                    border: var(--solid-shadow-block-border);
                }
            }
        }
    }

    @media (max-width: 1280px) {
        #stage-detail-container {
            position: relative;
            flex-direction: column;

            section {
                width: var(--body-width);
            }

            #stage-details {
                width: var(--body-width);

                .stage-detail {
                    &::after {
                        top: 0.625rem;
                        left: 0.625rem;
                    }

                    .stage-detail-list {
                        .list-element {
                            flex-direction: column;
                            gap: 0.25rem;
                            align-items: start;
                            width: 95%;

                            .list-label {
                                font-size: 0.875rem;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
