<script lang="ts">
    export let onClick: () => void
    export let direction: "up" | "down" = "up"
</script>

<button type="button" on:click={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 32 32">
        {#if direction == "up"}
            <path d="m14.8 6.4-10 17.3c-.6 1 .1 2.2 1.2 2.2h20c1.1 0 1.8-1.2 1.2-2.2l-10-17.3c-.5-.9-1.9-.9-2.4 0z" class="st0" />
        {:else}
            <path d="M14.8 25.6 4.8 8.2c-.6-.9.1-2.1 1.2-2.1h20c1.1 0 1.8 1.2 1.2 2.2l-10 17.3c-.5.9-1.9.9-2.4 0z" class="st0" />
        {/if}
    </svg>
</button>

<style lang="scss">
    button {
        display: contents;

        .st0 {
            fill: var(--color-medium-02);
        }
    }
</style>
