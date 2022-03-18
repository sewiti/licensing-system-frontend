<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import { loggedIn } from "../util/auth";
    import { brand } from "../util/const";

    onMount(() => {
        if (!get(loggedIn)) {
            navigate("/login");
        }
    });
</script>

<svelte:head>
    <title>{brand}</title>
</svelte:head>
