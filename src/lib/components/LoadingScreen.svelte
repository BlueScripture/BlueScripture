<!--NOTE: This component might be abandoned-->
<script lang="ts">
    import { onMount } from "svelte"
    import { Scroll } from "$lib/utils"

    let loadingScreenElement: HTMLDivElement
    let triangleElement: SVGPathElement
    let crossElement: SVGGElement
    let plusElement: SVGGElement
    let circleElement: SVGCircleElement

    let isAppLoaded = false

    function showLoadingScreen() {
        const icons = [triangleElement, crossElement, plusElement, circleElement]
        for (const [index, icon] of icons.entries()) {
            setTimeout(() => {
                icon.style.animationName = "loading-bounce"
            }, 160 * index)
        }
    }

    function hideLoadingScreen() {
        loadingScreenElement.style.opacity = "0"
        loadingScreenElement.addEventListener("transitionend", () => {
            isAppLoaded = true
        })
    }

    function load() {
        Scroll.lock()
        showLoadingScreen()
    }

    function completeLoad() {
        hideLoadingScreen()
        Scroll.unlock()
        window.sessionStorage.setItem("isCacheExists", "true")
    }

    onMount(() => {
        load()
        setTimeout(completeLoad, 2000)
    })
</script>

{#if !isAppLoaded}
    <div id="loading-screen" bind:this={loadingScreenElement}>
        <svg x="0" y="0" version="1.1" viewBox="0 0 1080 1080">
            <path id="triangle" class="icon" d="m349.5 513.2-31 53.6h62z" style="--position-x: 349.48; --position-y: 540; /* stylelint-disable-line */" bind:this={triangleElement} />
            <g id="cross" class="icon" style="--position-x: 478.75; --position-y: 540; /* stylelint-disable-line */" bind:this={crossElement}>
                <path d="m504.1 514.6-50.7 50.8M453.4 514.6l50.7 50.8" />
            </g>
            <g id="plus" class="icon" style="--position-x: 605.53; --position-y: 540; /* stylelint-disable-line */" bind:this={plusElement}>
                <path d="M634 540h-57M605.5 511.5v57" />
            </g>
            <circle id="circle" class="icon" cx="734.2" cy="540.3" r="27.3" style="--position-x: 734.23; --position-y: 540; /* stylelint-disable-line */" bind:this={circleElement} />
        </svg>
    </div>
{/if}

<style lang="scss">
    #loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100vw;
        height: 100vh;
        background-color: var(--color-medium-01);
        opacity: 1;
        transition-property: opacity;
    }

    path,
    circle {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-miterlimit: 10;
        stroke-width: 10;
    }

    #triangle {
        stroke: #fbde4b;
    }

    #plus {
        stroke: #5af37e;
    }

    #cross {
        stroke: #fb626a;
    }

    #circle {
        stroke: #46dafb;
    }

    .icon {
        transform: translateY(0.5rem);
        transform-origin: calc(100% * var(--position-x) / 1080) calc(100% * var(--position-y) / 1080);
        animation-duration: 2s;
        animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1) !important;
        animation-iteration-count: infinite;
    }

    @keyframes -global-loading-bounce {
        5% {
            transform: translateY(0.5rem);
        }

        50% {
            transform: translateY(-0.5rem);
        }

        95% {
            transform: translateY(0.5rem);
        }
    }
</style>
