<script lang="ts">
    import CrossButtonIcon from "$lib/components/CrossButtonIcon.svelte"
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import { EQUIPMENT_PARAMS_DICT } from "$lib/constants"
    import Items from "$lib/datas/itemList.json"
    import { mediaServerDomain } from "$lib/site.config"
    import { COMMON_ITEM_CATEGORY_TYPES, type CommonItemInfo, type EquipmentInfo, type ItemInfo } from "$lib/types"
    import { toggleListControlMenu } from "$lib/utils"

    export let data: {
        itemInfo: CommonItemInfo | EquipmentInfo | null
    }

    let items = structuredClone(Items) as ItemInfo[]
    let filterCondition: ItemInfo["category"][] = []
    let isListControlMenuOpened = false
    let listControlMenu: HTMLElement

    function filterItemList() {
        if (Object.values(filterCondition).every((value) => value.length == 0)) {
            return
        }

        items = items.filter((item) => {
            if (filterCondition.length > 0 && !filterCondition.includes(item.category)) {
                return false
            }
            return true
        })
    }

    $: PAGE_DESCRIPTION = data.itemInfo == null ? "「アイテム一覧」の中からアイテムを選択すると、詳細情報を確認できます。" : "アイテムの詳細なデータやドロップするステージなどを確認できます。"

    $: {
        filterCondition

        items = structuredClone(Items) as ItemInfo[]
        filterItemList()
    }
</script>

<svelte:head>
    {#if data.itemInfo == null}
        <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」のアイテム一覧ページです。{PAGE_DESCRIPTION}" />
    {:else}
        <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」のアイテム{data.itemInfo.name}の詳細ページです。{PAGE_DESCRIPTION}" />
        <meta name="thumbnail" content="//{mediaServerDomain}/item/{data.itemInfo.name}.webp" />
    {/if}
</svelte:head>

{#if data.itemInfo == null}
    <HeadlineGroup pageTitle="アイテム一覧" pageDescription={PAGE_DESCRIPTION} />
{:else}
    <HeadlineGroup pageTitle={data.itemInfo.name} pageDescription={PAGE_DESCRIPTION} />
{/if}

<div id="menu-toggle-button">
    <input type="checkbox" id="menu-toggle" bind:checked={isListControlMenuOpened} on:change={() => toggleListControlMenu(listControlMenu, isListControlMenuOpened)} />
    <label for="menu-toggle" id="menu-toggle-label">
        <CrossButtonIcon isOpen={isListControlMenuOpened} iconSize="1.05rem" />
        <span>絞り込みメニューを{isListControlMenuOpened ? "閉じる" : "開く"}</span>
    </label>
</div>
<section id="data-controls" style="height: 0;margin-bottom: 0;" bind:this={listControlMenu}>
    <section>
        <h2>フィルター</h2>
        <section>
            <h3>種類</h3>
            <div class="selectors packed">
                {#each [...COMMON_ITEM_CATEGORY_TYPES, "装備品"] as category}
                    <span class="selector">
                        <input type="checkbox" id="category-selector-{category}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition} value={category} />
                        <label for="category-selector-{category}">{category}</label>
                    </span>
                {/each}
            </div>
        </section>
    </section>
</section>

<section id="item-info-container">
    <section id="items">
        <h2>アイテム一覧</h2>
        <ul>
            {#each items as item}
                {#if item.category != "装備の設計図"}
                    <li class="item">
                        <a href="/items/{item.name}" data-item-rarity={item.rarity}>
                            <img class="item-icon" src="//{mediaServerDomain}/item/{item.name}.webp" width="81" height="64" alt={item.name} />
                        </a>
                    </li>
                {/if}
            {/each}
        </ul>
    </section>
    {#if data.itemInfo != null}
        {@const itemInfo = data.itemInfo}
        <section id="item-detail">
            <h2>アイテム情報</h2>
            <div id="item-summary-container">
                <div id="item-summary">
                    <img src="//{mediaServerDomain}/item/{itemInfo.name}.webp" alt={itemInfo.name} />
                    <div id="item-name-container">
                        <span id="item-category">
                            {#if itemInfo.category == "装備品"}
                                {itemInfo.equipmentCategory}・T{itemInfo.tier}
                            {:else}
                                {itemInfo.category}
                            {/if}
                        </span>
                        <h3 class="item-name">{itemInfo.name}</h3>
                    </div>
                </div>
                <p id="item-description">{itemInfo.description}</p>
            </div>
            {#if itemInfo.category == "装備品"}
                <h2>装備の効果値</h2>
                <ul id="equipment-params">
                    {#each itemInfo.params as param}
                        <li class="list-element">
                            <span class="list-label">{EQUIPMENT_PARAMS_DICT[param.paramType]}</span>
                            <span class="list-value">+{param.paramValue}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
            <h2>獲得可能なステージ</h2>
            {#if itemInfo.dropIn != null}
                <ul id="drop-stage-list">
                    <li>
                        <a class="recommended-stage" href="/stages/{itemInfo.dropIn.recommended}">{itemInfo.dropIn.recommended}</a>
                    </li>
                    {#each itemInfo.dropIn.stages as stage}
                        <li>
                            <a href="/stages/{stage}">{stage}</a>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p id="unobtainable-message">まだ新たに獲得することができません</p>
            {/if}
        </section>
    {/if}
</section>

<style lang="scss">
    #menu-toggle-button {
        position: relative;
        display: inline-block;
        margin-bottom: 1rem;

        label {
            display: flex;
            gap: 0.325rem;
            align-items: center;
            height: 1.05rem;
            padding: 0.15rem 0;
            margin-inline: 0.2rem;
            font-size: 1.05rem;

            span {
                white-space: nowrap;
            }
        }

        input {
            position: absolute;
            width: 100%;
            height: 100%;
            appearance: none;
        }
    }

    #data-controls {
        overflow-y: clip;
        transition-property: height, margin-bottom;

        h2 {
            margin: 0.875rem 0;
            font-size: 1.25rem;
        }

        section {
            h3 {
                margin: 0.5rem 0;
                font-size: 1.125rem;
                font-weight: normal;
            }
        }

        .selectors {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;

            // TODO: Firefoxが:hasセレクタに正式対応したら、label要素がラジオボタンを内包するように書き直す
            .selector {
                position: relative;

                label {
                    box-sizing: border-box;
                    display: block;
                    padding: 0.275rem 0.825rem;
                    font-size: 0.95rem;
                    font-feature-settings: "palt";
                    letter-spacing: 0.0625rem;
                    white-space: nowrap;
                    user-select: none;
                    background-color: var(--color-main-01);
                    border: solid 0.1rem var(--color-medium-03);
                    border-radius: 0.275rem;
                }

                input {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    appearance: none;
                }

                input:checked + label {
                    color: var(--color-white);
                    background-color: var(--color-dominant);
                    border-color: var(--color-main-02);
                }
            }

            &.packed {
                justify-content: flex-start;
            }

            @media (max-width: 1280px) {
                justify-content: normal;
            }
        }
    }

    #item-info-container {
        position: relative;
        display: flex;
        justify-content: space-between;

        section {
            position: relative;
            box-sizing: border-box;
            width: 47.5%;
            padding: 1rem 1.25rem;
            background: var(--solid-shadow-block-background);
            border: var(--solid-shadow-block-border);

            h2 {
                padding-bottom: 1rem;
                font-size: 1.25rem;
                font-weight: 600;
                text-align: center;
                border-bottom: solid 0.075rem var(--color-medium-04);

                &:not(:first-of-type) {
                    padding-top: 1rem;
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

            @media (max-width: 1280px) {
                width: 100%;
            }
        }

        #items {
            height: fit-content;

            ul {
                box-sizing: border-box;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
                gap: 0.75rem;
                height: 55vh;
                margin: 1.25rem 0 0.5rem 0.5rem;
                margin-left: 0.5rem;
                overflow-y: scroll;
                scrollbar-color: transparent;
                scrollbar-width: thin;

                .item {
                    a {
                        display: block;
                        width: fit-content;
                        height: fit-content;
                        background-color: var(--color-item-rarity-n);
                        border-radius: 0.5rem;

                        .item-icon {
                            width: 4.5rem;
                            height: auto;
                            padding: 0 0.5rem;

                            @media (max-width: 1280px) {
                                width: 4rem;
                            }
                        }

                        &[data-item-rarity="0"] {
                            background-color: var(--color-item-rarity-n);
                        }

                        &[data-item-rarity="1"] {
                            background-color: var(--color-item-rarity-r);
                        }

                        &[data-item-rarity="2"] {
                            background-color: var(--color-item-rarity-sr);
                        }

                        &[data-item-rarity="3"] {
                            background-color: var(--color-item-rarity-ssr);
                        }
                    }
                }

                &::-webkit-scrollbar {
                    width: 0.625rem;
                    height: 0.75rem;
                }

                &::-webkit-scrollbar-corner {
                    display: none;
                }

                &::-webkit-scrollbar-thumb {
                    background-color: var(--color-medium-04);
                    background-clip: padding-box;
                    border: solid transparent;
                    border-radius: 9999vh;
                }

                &::-webkit-scrollbar-track {
                    background-color: transparent;
                }

                @media (max-width: 1280px) {
                    height: 50vh;
                }
            }
        }

        @media (max-width: 1280px) {
            flex-direction: column;
            gap: 2.75rem;
        }
    }

    #item-detail {
        #item-summary-container {
            padding: 0 0.5rem;
            border-bottom: solid 0.075rem var(--color-medium-04);

            #item-summary {
                display: flex;
                gap: 0.75rem;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: solid 0.075rem var(--color-medium-03);

                img {
                    width: auto;
                    height: 3.75rem;
                }

                #item-name-container {
                    #item-category {
                        font-size: 0.925rem;
                        color: var(--color-medium-04);
                    }

                    h3 {
                        margin-top: 0.325rem;
                    }
                }
            }

            #item-description {
                padding: 0.5rem;
                font-size: 0.925rem;
                font-style: oblique;
                line-height: 1.375;
                color: var(--color-medium-04);
            }
        }

        #equipment-params {
            display: flex;
            flex-direction: column;
            gap: 0.575rem;
            padding: 0.875rem 1rem;
            border-bottom: solid 0.075rem var(--color-medium-04);

            .list-element {
                display: flex;
                gap: 0.5rem;
                align-items: center;

                .list-label {
                    font-size: 0.925rem;
                    color: var(--color-medium-04);
                }
            }
        }

        #drop-stage-list {
            display: flex;
            flex-direction: column;
            gap: 0.425rem;
            padding: 0.875rem 1rem;

            li {
                a {
                    font-feature-settings: "tnum";

                    &.recommended-stage::after {
                        content: "（おすすめ）";
                    }

                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }

        #unobtainable-message {
            padding: 1.25rem 0;
            font-size: 0.925rem;
            color: var(--color-medium-04);
            text-align: center;
        }
    }
</style>
