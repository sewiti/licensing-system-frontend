<script lang="ts">
    import { Route } from "svelte-navigator";
    import { fade } from "svelte/transition";
    import { cubicIn } from "svelte/easing";
</script>

<Route {...$$props}>
    <div in:fade={{ duration: 100, easing: cubicIn }}>
        <slot />
    </div>
</Route>
