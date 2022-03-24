<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { navigate } from "svelte-navigator";
    import { Button, Col, Container, Row, Table } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import { issuerID } from "../util/auth";
    import { fetchLicenseIssuers, LicenseIssuer } from "../util/licenseIssuer";
    import ShieldShaded from "svelte-bootstrap-icons/lib/ShieldShaded";
    import LicenseIssuerNew from "../components/LicenseIssuerNew.svelte";

    let loading = true;
    let licenseIssuers: LicenseIssuer[] = [];
    let createModal = false;

    onMount(async () => {
        licenseIssuers = await fetchLicenseIssuers();
        loading = false;
    });
    const onClickIssuer = (licenseIssuerID: number) => {
        navigate(`/license-issuers/${licenseIssuerID}`);
    };
    const toggleCreateModal = (event?: MouseEvent) => {
        event?.preventDefault();
        createModal = !createModal;
    };
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb />
        <Row>
            <Col xs="12" sm="6">
                <h4>License issuers</h4>
            </Col>
            <Col xs="12" sm="6" class="text-end">
                <Button
                    color="primary"
                    class="d-none d-sm-inline"
                    outline
                    on:click={toggleCreateModal}
                >
                    New license issuer
                </Button>
                <Button
                    color="primary"
                    class="d-block w-100 d-sm-none"
                    outline
                    on:click={toggleCreateModal}
                >
                    New license issuer
                </Button>
            </Col>
        </Row>
        <!-- <div class="mt-3 mb-1 d-flex align-items-end justify-content-between">
            <h4 class="mb-0">License issuers</h4>
            <span class="align-bottom text-secondary">
                {licenseIssuers.length}
            </span>
        </div> -->
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
                    <tr class="clickable" on:click={() => onClickIssuer(li.ID)}>
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
    <LicenseIssuerNew isOpen={createModal} toggle={toggleCreateModal} />
</Container>
