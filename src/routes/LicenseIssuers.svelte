<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-navigator";
    import { Container, Table } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import { issuerID } from "../util/auth";
    import { fetchLicenseIssuers, LicenseIssuer } from "../util/licenseIssuer";
    import ShieldShaded from "svelte-bootstrap-icons/lib/ShieldShaded";

    let loading = true;
    let licenseIssuers: LicenseIssuer[] = [];

    onMount(async () => {
        licenseIssuers = await fetchLicenseIssuers();
        loading = false;
    });

    const onClick = (licenseIssuerID: number) => {
        navigate(`/license-issuers/${licenseIssuerID}`);
    };
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb />
        <Table striped hover class="align-middle">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Max licenses</th>
                    <th>Updated</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {#each licenseIssuers as li (li.ID)}
                    <tr class="clickable" on:click={() => onClick(li.ID)}>
                        <td>
                            {li.Username}
                            {#if li.ID === 0}
                                <ShieldShaded
                                    class="text-secondary"
                                    width="0.9em"
                                    height="0.9em"
                                />
                            {/if}
                            {#if li.ID === $issuerID}
                                <span class="text-secondary">(You)</span>
                            {/if}
                        </td>
                        <td>
                            {#if li.MaxLicenses > 0}
                                {li.MaxLicenses}
                            {:else}
                                <span class="text-secondary fst-italic">
                                    Unlimited
                                </span>
                            {/if}
                        </td>
                        <td>{li.Updated.toLocaleString()}</td>
                        <td>{li.Created.toLocaleString()}</td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    </Loader>
</Container>
