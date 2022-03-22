<script lang="ts">
    import { onMount } from "svelte";
    import { navigate, useFocus } from "svelte-navigator";
    import { logout } from "../util/auth";
    import { Container } from "sveltestrap";
    import { brand } from "../util/const";

    const focus = useFocus();
    onMount(() => {
        logout();
        navigate("/login");
    });
</script>

<svelte:head>
    <title>Logout - {brand}</title>
</svelte:head>

<Container class="text-center">
    <h4 class="text-secondary">Logging out...</h4>
    <a
        href="/"
        class="btn btn-outline-primary btn-sm mt-2"
        on:click|preventDefault={() => navigate("/")}
        use:focus
    >
        Go home
    </a>
</Container>
