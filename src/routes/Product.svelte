<script lang="ts">
    import { useFocus } from "svelte-navigator";
    import {
        Button,
        Container,
        Tooltip,
        Col,
        Row,
        ButtonDropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem,
        Badge,
    } from "sveltestrap";
    import { fetchLicenses, License } from "../util/license";
    import { licenseIssuer, product } from "../util/state";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import PlusLg from "svelte-bootstrap-icons/lib/PlusLg";
    import PersonFill from "svelte-bootstrap-icons/lib/PersonFill";
    import Envelope from "svelte-bootstrap-icons/lib/Envelope";
    import Telephone from "svelte-bootstrap-icons/lib/Telephone";
    import LicenseIssuerEdit from "../components/LicenseIssuerEdit.svelte";
    import ChangePasswd from "../components/ChangePasswd.svelte";
    import { derived } from "svelte/store";
    import LicenseModal from "../components/LicenseModal.svelte";
    import LicenseIssuerDelete from "../components/LicenseIssuerDelete.svelte";
    import PageControl from "../components/PageControl.svelte";
    import LicenseRow from "../components/LicenseRow.svelte";
    import { brand } from "../util/const";
    import { fetchProduct } from "../util/product";

    export let licenseIssuerID: number;
    export let productID: number;
    $: loadData(licenseIssuerID, productID);
    let loading = true;
    let editModal = false;
    let deleteModal = false;
    let licenseModal = false;
    let chpasswdModal = false;
    let licenses: License[] = [];

    let search: string = "";

    const focus = useFocus();

    let limitReached: boolean;
    $: limitReached =
        $licenseIssuer.MaxLicenses > 0 &&
        licenses.length >= $licenseIssuer.MaxLicenses;

    const loadData = async (licenseIssuerID: number, productID: number) => {
        loading = true;
        product.set(await fetchProduct(licenseIssuerID, productID));
        licenses = await fetchLicenses(licenseIssuerID);
        loading = false;
    };
    const toggleEditModal = (event?: MouseEvent) => {
        event?.preventDefault();
        editModal = !editModal;
    };
    const toggleDeleteModal = (event?: MouseEvent) => {
        event?.preventDefault();
        deleteModal = !deleteModal;
    };
    const toggleChpasswdModal = (event?: MouseEvent) => {
        event?.preventDefault();
        chpasswdModal = !chpasswdModal;
    };
    const toggleLicenseModal = (event?: MouseEvent) => {
        event?.preventDefault();
        licenseModal = !licenseModal;
    };

    let filtered: License[] = [];
    $: filtered = licenses.filter((v) => {
        if (search === "") {
            return true;
        }
        const lower = search.toLowerCase();
        if (v.Name === "") {
            if ("unnamed license".indexOf(lower) >= 0) {
                return true;
            }
        } else if (v.Name.indexOf(search) >= 0) {
            return true;
        }
        if (v.Note.indexOf(search) >= 0) {
            return true;
        }
        if (v.ValidUntil === null) {
            if ("no expiry".indexOf(lower) >= 0) {
                return true;
            }
        } else if (v.ValidUntil < new Date() && "expired".indexOf(lower) >= 0) {
            return true;
        }
        if (v.LastUsed === null && "not used".indexOf(lower) >= 0) {
            return true;
        }
        const matchesTag = v.Tags.reduce(
            (a, v) => (v.indexOf(search) >= 0 ? true : a),
            false
        );
        return matchesTag;
    });

    const onClickTag = (e: CustomEvent<{ tag: string }>) => {
        search = e.detail.tag;
    };

    let paginated: License[] = [];
    $: paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const perPage = 8;
    let page = 1;
</script>

<svelte:head>
    {#if loading}
        <title>{brand}</title>
    {:else}
        <title>{$licenseIssuer.Username} - {brand}</title>
    {/if}
</svelte:head>

<Container md>
    <Loader {loading}>
        <Breadcrumb active="license-issuer" />
        <Row>
            <Col xs="12" class="d-flex mb-1">
                <PersonFill
                    class={$licenseIssuer.Active ? "" : "text-secondary"}
                    style={"min-width:4em;min-height:4em;" +
                        ($licenseIssuer.Active ? "color: rgb(58 77 135);" : "")}
                />
                <div class="mx-2">
                    <h4 class="mb-1">
                        {$licenseIssuer.Username}
                        {#if $licenseIssuer.ID === 0}
                            <Badge
                                class="align-middle"
                                style="font-size: small;"
                                color="danger"
                            >
                                Admin
                            </Badge>
                        {/if}
                        {#if !$licenseIssuer.Active}
                            <Badge
                                class="align-middle"
                                style="font-size: small;"
                                color="secondary"
                            >
                                Inactive
                            </Badge>
                        {/if}
                    </h4>
                    {#if $licenseIssuer.Email !== ""}
                        <div>
                            <Envelope class="text-secondary" />
                            <a
                                href={`mailto:${$licenseIssuer.Email}`}
                                class="text-secondary"
                            >
                                {$licenseIssuer.Email}
                            </a>
                        </div>
                    {/if}
                    {#if $licenseIssuer.PhoneNumber !== ""}
                        <div>
                            <Telephone class="text-secondary" />
                            <a
                                href={`tel:${$licenseIssuer.PhoneNumber}`}
                                class="text-secondary"
                            >
                                {$licenseIssuer.PhoneNumber}
                            </a>
                        </div>
                    {/if}
                    {#if $licenseIssuer.Email === "" && $licenseIssuer.PhoneNumber === ""}
                        <div class="text-secondary fst-italic">
                            No contact information
                        </div>
                    {/if}
                </div>
                <div class="flex-grow-1 text-end">
                    <ButtonDropdown>
                        <span id="edit-license-issuer-wrapper">
                            <Button
                                color={$licenseIssuer.Active
                                    ? "primary"
                                    : "secondary"}
                                class="text-nowrap"
                                outline
                                on:click={toggleEditModal}
                            >
                                Edit product
                            </Button>
                        </span>
                        <DropdownToggle
                            split
                            color={$product.Active ? "primary" : "secondary"}
                            outline
                        />
                        <DropdownMenu end>
                            <DropdownItem on:click={toggleDeleteModal}>
                                Delete product
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                </div>
            </Col>
        </Row>

        <Row>
            <Col class="mt-3 mb-1 d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <h4 class="mb-0 text-nowrap">Licenses</h4>
                    <span
                        class="ms-2 me-3 align-bottom text-nowrap text-secondary"
                    >
                        {licenses.length}
                        /
                        {$licenseIssuer.MaxLicenses <= 0
                            ? "Unlimited"
                            : $licenseIssuer.MaxLicenses}
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
                    disabled={limitReached}
                    on:click={toggleLicenseModal}
                >
                    New license
                </Button>
                <Button
                    color="primary"
                    class="d-sm-none"
                    disabled={limitReached}
                    on:click={toggleLicenseModal}
                >
                    <PlusLg style="min-width:1.2em;min-height:1.2em;" />
                </Button>
            </Col>
        </Row>

        <Container md>
            <Row class="mt-1 py-1 border-bottom border-2">
                <Col xs="5" class="fw-bolder">Name</Col>
                <Col xs="4" class="fw-bolder">Expires</Col>
                <Col xs="3" class="fw-bolder">Last used</Col>
            </Row>
            {#each paginated as l, i (l?.ID)}
                <LicenseRow {l} index={i} on:clickTag={onClickTag} />
            {/each}
            {#if paginated.length === 0}
                <LicenseRow empty />
            {/if}
            {#if filtered.length > perPage}
                {#each { length: (perPage - paginated.length) % perPage } as _}
                    <LicenseRow placeholder />
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
    <LicenseIssuerEdit isOpen={editModal} toggle={toggleEditModal} />
    <LicenseIssuerDelete isOpen={deleteModal} toggle={toggleDeleteModal} />
    <ChangePasswd
        username={derived(licenseIssuer, (f) => f.Username)}
        isOpen={chpasswdModal}
        toggle={toggleChpasswdModal}
    />
    <LicenseModal isOpen={licenseModal} toggle={toggleLicenseModal} />
</Container>
