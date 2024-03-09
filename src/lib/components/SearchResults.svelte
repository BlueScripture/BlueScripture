<script lang="ts">
    import type { SearchResult } from "$lib/types"

    export let isDisplayed: boolean
    export let isQueryEmpty = true
    export let searchResult: SearchResult = {
        students: [],
        stages: [],
        items: []
    }

    let searchResultsContainerElement: HTMLDivElement

    $: {
        if (searchResultsContainerElement) {
            if (isDisplayed) {
                searchResultsContainerElement.style.display = ""
                requestAnimationFrame(() => (searchResultsContainerElement.style.opacity = "1"))
            } else {
                searchResultsContainerElement.style.opacity = "0"
                searchResultsContainerElement.ontransitionend = () => {
                    searchResultsContainerElement.style.display = "none"
                }
            }
        }
    }
</script>

{#if !isQueryEmpty}
    <div class="search-results-container" bind:this={searchResultsContainerElement}>
        {#if searchResult && Object.values(searchResult).flat().length > 0}
            {#if searchResult.students.length > 0}
                <p class="legend">生徒名簿</p>
                <ul class="search-results">
                    {#each searchResult.students as student}
                        <li class="result">
                            <a href="/students/{student.name}">{student.name} </a>
                        </li>
                    {/each}
                </ul>
            {/if}
            {#if searchResult.stages.length > 0}
                <p class="legend">任務一覧</p>
                <ul class="search-results">
                    {#each searchResult.stages as stage}
                        <li class="result">
                            <a href="/stages/{stage.stageID}">{stage.name} </a>
                        </li>
                    {/each}
                </ul>
            {/if}
            {#if searchResult.items.length > 0}
                <p class="legend">アイテム</p>
                <ul class="search-results">
                    {#each searchResult.items as item}
                        <li class="result">
                            <a href="/items/{item.name}">{item.name} </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        {:else}
            <p class="no-result-message">検索結果がありません。</p>
        {/if}
    </div>
{/if}

<style lang="scss">
    $border: solid 0.075rem var(--color-medium-03);

    .search-results-container {
        position: absolute;
        top: 1;
        right: 0;
        box-sizing: border-box;
        width: 125%;
        padding: 0 1rem;
        margin-top: 0.5rem;
        font-size: 0.925rem;
        color: var(--color-medium-04);
        background-color: var(--color-main-01);
        border: $border;
        border-radius: 0.25rem;
        transition-duration: 0.3s;
        transition-property: opacity;

        .legend {
            padding: 0.75rem 0;
            font-weight: bold;
            border-bottom: $border;
        }

        .search-results {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.75rem 0 0.75rem 0.75rem;

            .result {
                a {
                    display: block;
                    text-decoration: none;
                }
            }
        }

        .no-result-message {
            padding: 0.5rem 0.75rem;
            color: var(--color-medium-03);
        }

        @media (max-width: 1280px) {
            right: 0;
            width: 100%;
        }
    }
</style>
