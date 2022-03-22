<script lang="ts">
    import { fade } from "svelte/transition";
    import { cubicIn } from "svelte/easing";
    import { Spinner } from "sveltestrap";
    export let loading;
    export let useTransition = true;
</script>

{#if loading}
    {#if useTransition}
        <div in:fade={{ duration: 200, easing: cubicIn }} class="text-center">
            <Spinner />
        </div>
    {:else}
        <div class="text-center">
            <Spinner />
        </div>
    {/if}
{:else if useTransition}
    <div in:fade={{ duration: 100, easing: cubicIn }}>
        <slot />
    </div>
{:else}
    <div>
        <slot />
    </div>
{/if}
