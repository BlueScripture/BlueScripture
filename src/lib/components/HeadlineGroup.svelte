<script lang="ts">
    export let pageTitle: string
    export let pageDescription: string | null
</script>

<hgroup>
    <h1>{pageTitle}</h1>
    {#if pageDescription != null}
        <p class="sentence">{pageDescription}</p>
    {/if}
</hgroup>

<style lang="scss">
    hgroup {
        margin-bottom: 1.5rem;

        h1 {
            margin-bottom: 0.425rem;
        }
    }
</style>
