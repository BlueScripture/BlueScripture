<script lang="ts">
    import PageTitleList from "$lib/datas/pageTitleList.json"
    import Logo from "./Logo.svelte"
    import AccordionMenuIcon from "./AccordionMenuIcon.svelte"
    import { afterNavigate } from "$app/navigation"
    import type { PageTitle, SearchResult } from "$lib/types"
    import { Search } from "$lib/utils"
    import SearchResults from "./SearchResults.svelte"
    export let pageTitles: PageTitle[] = []

    let isAccordionMenuOpen = false
    let isSearchBoxFocused = false
    let searchQuery = ""
    let searchResult: SearchResult

    afterNavigate(() => {
        isAccordionMenuOpen = false
        searchQuery = ""
    })

    $: {
        searchResult = Search.search(searchQuery)
    }
</script>

<header>
    <div class="outer">
        <nav id="sitemap-header-desktop">
            <a href="/" aria-label="ホーム"><span class="logo"><Logo /></span></a>
            {#each PageTitleList as pageTitle}
                {#if pageTitle.level == 0}
                    <a class="hover-underline" href="/{pageTitle.path}">{pageTitle.title}</a>
                {/if}
            {/each}
            <div class="search-box">
                <input type="search-input" placeholder="検索" bind:value={searchQuery} on:focusin={() => (isSearchBoxFocused = true)} on:focusout={() => (isSearchBoxFocused = false)} />
                <SearchResults {searchResult} isDisplayed={isSearchBoxFocused} isQueryEmpty={searchQuery.length == 0} />
            </div>
        </nav>
        <nav id="sitemap-header-mobile">
            <a href="/"><span class="logo"><Logo /></span></a>
            <span id="accordion-menu-control">
                <input type="checkbox" id="accordion-menu-toggle-button" aria-label="サイトマップを開く" bind:checked={isAccordionMenuOpen} />
                <label for="accordion-menu-toggle-button"><AccordionMenuIcon /></label>
            </span>
            <ul id="accordion-menu" data-accordion-menu-open={isAccordionMenuOpen}>
                <div aria-hidden={!isAccordionMenuOpen}>
                    <div class="search-box">
                        <input type="search-input" placeholder="検索" bind:value={searchQuery} on:focusin={() => (isSearchBoxFocused = true)} on:focusout={() => (isSearchBoxFocused = false)} />
                        <SearchResults {searchResult} isDisplayed={isSearchBoxFocused} isQueryEmpty={searchQuery.length == 0} />
                    </div>
                    {#each PageTitleList as pageTitle}
                        {#if pageTitle.level == 0}
                            <li>
                                <a href="/{pageTitle.path}" tabindex={isAccordionMenuOpen ? 0 : -1}>
                                    <span>{pageTitle.title}</span>
                                    <span>/{pageTitle.path}</span>
                                </a>
                            </li>
                        {/if}
                    {/each}
                </div>
            </ul>
        </nav>
    </div>
    <div class="outer">
        <nav id="breadcrumb-list">
            <ol>
                {#each pageTitles as pageTitle}
                    <li>
                        <a class="hover-underline" href="/{pageTitle.path}">
                            <span>{pageTitle.title}</span>
                        </a>
                    </li>
                {/each}
            </ol>
        </nav>
    </div>
</header>

<style lang="scss">
    header {
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .outer {
        min-width: 100%;
        max-width: 100vw;
        color: var(--color-medium-04);
        background-color: var(--color-main-01);

        &:nth-of-type(1) {
            height: var(--header-height);
        }

        &:nth-of-type(2) {
            position: relative;
            z-index: -2;
            padding: 0.3rem 0;
            background-color: var(--color-medium-01);
            border: solid 0.075rem var(--color-medium-02);
            border-right: none;
            border-left: none;
        }
    }

    nav {
        width: var(--body-width);
        margin: 0 auto;

        .search-box {
            position: relative;
            margin-left: auto;

            input {
                box-sizing: border-box;
                padding: 0.25rem 0.75rem;
                font-family: "Inter", "Kinto", sans-serif;
                font-size: 0.925rem;
                border: solid 0.075rem var(--color-medium-02);
                border-radius: 0.25rem;
            }
        }
    }

    a {
        font-size: 0.925rem;
    }

    #sitemap-header-desktop {
        display: flex;
        gap: 2rem;
        align-items: center;
        height: inherit;
    }

    #sitemap-header-mobile {
        display: none;
    }

    .logo {
        display: block;
        width: calc((var(--header-height) * 0.525) * 4.156);
        height: calc(var(--header-height) * 0.525);
        pointer-events: none;
    }

    #breadcrumb-list {
        ol {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            height: inherit;

            li:not(:last-of-type)::after {
                margin: 0 1rem;
                color: var(--color-medium-03);
                content: "/";
            }

            li::marker {
                font-size: 0;
            }
        }
    }

    @media (max-width: 1280px) {
        #sitemap-header-desktop {
            display: none;
        }

        #sitemap-header-mobile {
            position: relative;
            box-sizing: border-box;
            display: block;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: inherit;
            padding: 0 calc((100% - var(--body-width)) / 2);

            #accordion-menu-control {
                position: relative;
                display: block;
                width: calc(var(--header-height) * 0.525);
                height: calc(var(--header-height) * 0.525);
                cursor: pointer;

                input {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    appearance: none;
                }
            }

            #accordion-menu {
                position: absolute;
                bottom: 0;
                left: 0;
                z-index: -1;
                box-sizing: border-box;
                width: 100%;
                background-color: var(--color-main-01);
                border-bottom: solid 0.075rem var(--color-medium-02);
                transition-property: transform;
                transform: translateY(0%);

                & > div {
                    display: flex;
                    flex-direction: column;
                    gap: 1.65rem;
                    width: var(--body-width);
                    padding: 1.5rem 0 2rem;
                    margin: 0 auto;

                    .search-box {
                        display: block;
                        margin: 0;

                        input {
                            width: 100%;
                        }
                    }
                }

                li {
                    a {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 1.075rem;
                    }

                    &::marker {
                        font-size: 0;
                    }
                }
            }

            #accordion-menu[data-accordion-menu-open="true"] {
                transform: translateY(100%);
            }
        }
    }
</style>
