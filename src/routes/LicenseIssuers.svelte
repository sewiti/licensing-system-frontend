<script lang="ts">
    import { onMount } from "svelte";
    import { useFocus } from "svelte-navigator";
    import { Button, Col, Container, Row } from "sveltestrap";
    import { fetchLicenseIssuers, LicenseIssuer } from "../util/licenseIssuer";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import LicenseIssuerNew from "../components/LicenseIssuerNew.svelte";
    import PageControl from "../components/PageControl.svelte";
    import LicenseIssuerRow from "../components/LicenseIssuerRow.svelte";
    import PlusLg from "svelte-bootstrap-icons/lib/PlusLg";
    import { brand } from "../util/const";

    let loading = true;
    let licenseIssuers: LicenseIssuer[] = [];
    let createModal = false;
    let search: string = "";

    const focus = useFocus();

    let filtered: LicenseIssuer[] = [];
    $: filtered = licenseIssuers.filter((v) => {
        if (search === "") {
            return true;
        }
        if (v.Username.indexOf(search) >= 0) {
            return true;
        }
        if (v.Email.indexOf(search) >= 0) {
            return true;
        }
        if (
            v.PhoneNumber.replace(/[() +-]/g, "").indexOf(
                search.replace(/[() +-]/g, "")
            ) >= 0
        ) {
            return true;
        }
        const lower = search.toLowerCase();
        if (!v.Active && "inactive".indexOf(lower) >= 0) {
            return true;
        }
        if (v.MaxLicenses <= 0 && "unlimited".indexOf(lower) >= 0) {
            return true;
        }
        return false;
    });

    let paginated: LicenseIssuer[] = [];
    $: paginated = filtered.slice((page - 1) * perPage, page * perPage);

    onMount(async () => {
        licenseIssuers = await fetchLicenseIssuers();
        loading = false;
    });
    const toggleCreateModal = (event?: MouseEvent) => {
        event?.preventDefault();
        createModal = !createModal;
    };

    const perPage = 10;
    let page = 1;
</script>

<svelte:head>
    <title>License issuers - {brand}</title>
</svelte:head>

<Container md>
    <Loader {loading}>
        <Breadcrumb />

        <Row>
            <Col class="mb-1 d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <h4 class="mb-0 text-nowrap">License issuers</h4>
                    <span
                        class="ms-2 me-3 align-bottom text-nowrap text-secondary"
                    >
                        {licenseIssuers.length}
                    </span>
                </div>
                <div class="flex-grow-1" />
                <input
                    class="form-control me-1"
                    placeholder="Search"
                    style="max-width:15em;"
                    bind:value={search}
                    use:focus
                />
                <Button
                    color="primary"
                    class="d-none d-sm-block text-nowrap"
                    on:click={toggleCreateModal}
                >
                    New issuer
                </Button>
                <Button
                    color="primary"
                    class="d-sm-none"
                    on:click={toggleCreateModal}
                >
                    <PlusLg style="min-width:1.2em;min-height:1.2em;" />
                </Button>
            </Col>
        </Row>

        <!-- <Row>
            <Col class="mt-1 mb-2">
                <InputGroup>
                    <input
                        class="form-control"
                        placeholder="Search"
                        bind:value={search}
                        use:focus
                    />
                    <Button color="primary" on:click={toggleCreateModal}>
                        New issuer
                    </Button>
                </InputGroup>
            </Col>
        </Row> -->

        <Container md>
            <Row class="mt-1 py-1 border-bottom border-2">
                <Col xs="7" sm="8" class="fw-bolder">Username</Col>
                <Col xs="5" sm="4" class="fw-bolder">Max licenses</Col>
            </Row>
            {#each paginated as li (li.ID)}
                <LicenseIssuerRow {li} />
            {/each}
            {#if paginated.length === 0}
                <LicenseIssuerRow empty />
            {/if}
            {#if filtered.length > perPage}
                {#each { length: (perPage - paginated.length) % perPage } as _}
                    <LicenseIssuerRow placeholder />
                {/each}
            {/if}
        </Container>
        {#if filtered.length > perPage}
            <Row>
                <Col class="my-3">
                    <PageControl bind:page {perPage} total={filtered.length} />
                </Col>
            </Row>
        {/if}
    </Loader>
    <LicenseIssuerNew isOpen={createModal} toggle={toggleCreateModal} />
</Container>
