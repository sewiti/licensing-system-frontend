<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-navigator";
    import { issuerID, loggedIn } from "../util/auth";
    import { brand } from "../util/const";

    onMount(() => {
        if (!$loggedIn) {
            navigate("/login");
            return;
        }
        navigate(`/license-issuers/${$issuerID}`, { replace: true });
    });
</script>

<svelte:head>
    <title>{brand}</title>
</svelte:head>

<h6 />

<!-- <Container md>
    <Row>
        <HomeItem to={`/license-issuers/${$issuerID}`} {focus}>
            <h4 slot="title">My licenses</h4>
        </HomeItem>
        {#if $isPrivileged}
            <HomeItem to="/license-issuers">
                <h4 slot="title">License issuers</h4>
            </HomeItem>
        {/if}
    </Row>
</Container> -->
