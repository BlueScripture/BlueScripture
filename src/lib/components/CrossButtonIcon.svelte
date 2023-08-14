<script>
    export let isOpen = false
    export let iconSize = "1rem"

    let upperPathDashOffset = 22.5
    let lowerPathDashOffset = 22.5

    $: if (isOpen) {
        upperPathDashOffset = 0
        setTimeout(() => {
            lowerPathDashOffset = 0
        }, 125)
    } else {
        upperPathDashOffset = 22.5
        setTimeout(() => {
            lowerPathDashOffset = 22.5
        }, 125)
    }
</script>

<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" x="0" y="0" version="1.1" viewBox="0 0 36 36" style="--icon-size: {iconSize}; /* stylelint-disable-line */">
    <path d="M2 34 36 0" class="st0" style="stroke-dashoffset: {upperPathDashOffset};" />
    <path d="M2 2 36 36" class="st0" style="stroke-dashoffset: {lowerPathDashOffset};" />
</svg>

<style lang="scss">
    svg {
        /* %でサイズを指定するとWebKit系ブラウザで表示が崩れるので絶対値を使う */
        width: calc(var(--icon-size) * 0.75);
        height: calc(var(--icon-size) * 0.75);
    }

    .st0 {
        fill: none;
        stroke: var(--color-dominant);
        stroke-dasharray: 45;
        stroke-linecap: round;
        stroke-miterlimit: 10;
        stroke-width: 5;
        transition: stroke-dashoffset 0.25s;
    }
</style>
