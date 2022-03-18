<script lang="ts">
    import { Container } from "sveltestrap";
    import { navigate, useFocus } from "svelte-navigator";
    import { brand } from "../util/const";

    const focus = useFocus();
    const goHome = (event: MouseEvent) => {
        event.preventDefault();
        navigate("/");
    };
</script>

<svelte:head>
    <title>Page Not Found - {brand}</title>
</svelte:head>

<Container class="text-center">
    <h4 class="text-secondary">Page Not Found</h4>
    <a
        href="/"
        class="btn btn-outline-primary btn-sm mt-2"
        on:click={goHome}
        use:focus
    >
        Go home
    </a>
</Container>
