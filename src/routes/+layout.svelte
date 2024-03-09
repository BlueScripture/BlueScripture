<script lang="ts">
    import "$lib/global.css"
    import Header from "$lib/components/Header.svelte"
    import Footer from "$lib/components/Footer.svelte"
    import { page } from "$app/stores"
    import { afterNavigate } from "$app/navigation"
    import { siteName } from "$lib/site.config"
    import { getCurrentLocation, validatePath } from "$lib/utils"
    import type { PageTitle } from "$lib/types"

    let pageTitleArray: PageTitle[] = getCurrentLocation($page.url.pathname)
    let currentPageTitle = pageTitleArray[pageTitleArray.length - 1].title

    $: {
        validatePath($page.url.href)
    }

    afterNavigate(() => {
        pageTitleArray = getCurrentLocation($page.url.pathname)
        currentPageTitle = pageTitleArray[pageTitleArray.length - 1].title
    })
</script>

<svelte:head>
    <title>{currentPageTitle} - {siteName}</title>
    {#if import.meta.env.PROD}
        <script defer data-domain="bluescripture.net" src="https://analytics.bluescripture.net/js/script.js"></script>
    {/if}
</svelte:head>

<div class="app">
    <Header pageTitles={pageTitleArray} />
    {#if $page.url.pathname == "/"}
        <img id="hero-image" srcset="/asset/image/hero-image_small.webp 1280w, /asset/image/hero-image_large.webp" width="1440" height="360" alt="" />
    {/if}
    <main>
        <slot />
    </main>

    <Footer />
</div>

<style lang="scss">
    main {
        width: var(--body-width);

        // NOTE: Prevent layout shifts caused by scrollbars in desktop browsers
        min-height: calc(100svh - var(--header-height));
        margin: 2rem auto;
    }

    #hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    @media (max-width: 1280px) {
        #hero-image {
            height: max(7.5rem, 20vw);
            object-position: 32.5% center;
        }
    }
</style>
