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
    import { fetchLicenses } from "../util/license";
    import {
        deleteLicenseIssuer,
        fetchLicenseIssuer,
    } from "../util/licenseIssuer";
    import { licenseIssuer, licenses } from "../util/state";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import QuestionCircle from "svelte-bootstrap-icons/lib/QuestionCircle";
    import Loader from "../components/Loader.svelte";
    import PlusLg from "svelte-bootstrap-icons/lib/PlusLg";
    import PersonFill from "svelte-bootstrap-icons/lib/PersonFill";
    import Envelope from "svelte-bootstrap-icons/lib/Envelope";
    import Telephone from "svelte-bootstrap-icons/lib/Telephone";
    import LicenseIssuerEdit from "../components/LicenseIssuerEdit.svelte";
    import ChangePasswd from "../components/ChangePasswd.svelte";
    import { derived } from "svelte/store";
    import PageControl from "../components/PageControl.svelte";
    import { brand } from "../util/const";
    import { fetchProducts, Product } from "../util/product";
    import ProductRow from "../components/ProductRow.svelte";
    import ProductModal from "../components/ProductModal.svelte";
    import DeleteModal from "../components/DeleteModal.svelte";
    import { isPrivileged } from "../util/auth";

    export let licenseIssuerID: number;
    $: loadData(licenseIssuerID);
    let loading = true;
    let editModal = false;
    let deleteModal = false;
    let licenseModal = false;
    let chpasswdModal = false;
    let products: Product[] = [];

    let search: string = "";

    const focus = useFocus();

    const loadData = async (licenseIssuerID: number) => {
        loading = true;
        licenseIssuer.set(await fetchLicenseIssuer(licenseIssuerID));
        licenses.set(await fetchLicenses(licenseIssuerID));
        products = await fetchProducts(licenseIssuerID);
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

    let filtered: Product[] = [];
    $: filtered = products.filter((v) => {
        if (search === "") {
            return true;
        }
        const lower = search.toLowerCase();
        if (v.Name === "") {
            if ("unnamed product".indexOf(lower) >= 0) {
                return true;
            }
        } else if (v.Name.indexOf(search) >= 0) {
            return true;
        }
        return false;
    });

    const onDelete = async (): Promise<boolean> => {
        return deleteLicenseIssuer($licenseIssuer.ID);
    };

    const onClickTag = (e: CustomEvent<{ tag: string }>) => {
        search = e.detail.tag;
    };

    let paginated: Product[] = [];
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
                </div>
                <div class="flex-grow-1 text-end">
                    <ButtonDropdown>
                        <span id="edit-license-issuer-wrapper">
                            <Button
                                id="edit-issuer"
                                color={$licenseIssuer.Active
                                    ? "primary"
                                    : "secondary"}
                                class="text-nowrap"
                                outline
                                disabled={$licenseIssuer.ID === 0}
                                on:click={toggleEditModal}
                                style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
                            >
                                Edit issuer
                            </Button>
                        </span>
                        {#if $licenseIssuer.ID === 0}
                            <Tooltip
                                target="edit-license-issuer-wrapper"
                                placement="left"
                                animation
                            >
                                {$licenseIssuer.Username} is immutable
                            </Tooltip>
                        {/if}
                        <DropdownToggle
                            id="issuer-dropdown"
                            split
                            color={$licenseIssuer.Active
                                ? "primary"
                                : "secondary"}
                            outline
                        />
                        <DropdownMenu end>
                            <DropdownItem
                                id="change-passwd"
                                on:click={toggleChpasswdModal}
                            >
                                Change password
                            </DropdownItem>
                            {#if $isPrivileged}
                                <div id="delete-license-issuer-wrapper">
                                    <DropdownItem
                                        id="delete-issuer"
                                        disabled={$licenseIssuer.ID === 0}
                                        on:click={toggleDeleteModal}
                                    >
                                        Delete issuer
                                    </DropdownItem>
                                </div>
                                {#if $licenseIssuer.ID === 0}
                                    <Tooltip
                                        target="delete-license-issuer-wrapper"
                                        placement="left"
                                        animation
                                    >
                                        {$licenseIssuer.Username} is immutable
                                    </Tooltip>
                                {/if}
                            {/if}
                        </DropdownMenu>
                    </ButtonDropdown>
                </div>
            </Col>
            <Col xs="12" class="mt-2">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Info</h4>
                    {#if $licenseIssuer.Email !== ""}
                        <div>
                            <Envelope />
                            <a
                                href={`mailto:${$licenseIssuer.Email}`}
                                class="text-dark"
                            >
                                {$licenseIssuer.Email}
                            </a>
                        </div>
                    {/if}
                    {#if $licenseIssuer.PhoneNumber !== ""}
                        <div>
                            <Telephone />
                            <a
                                href={`tel:${$licenseIssuer.PhoneNumber}`}
                                class="text-dark"
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
            </Col>
        </Row>

        <Row>
            <Col class="mt-3 mb-1 d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <h4 class="mb-0 text-nowrap">Products</h4>
                    <span
                        id="products-count"
                        class="ms-2 me-3 align-bottom text-nowrap text-secondary"
                    >
                        {products.length}
                        ({$licenseIssuer.MaxLicenses <= 0
                            ? "Unlimited"
                            : $licenseIssuer.MaxLicenses})
                        <QuestionCircle class="text-secondary" />
                    </span>

                    <Tooltip target="products-count" placement="bottom">
                        {products.length} products<br />
                        {#if $licenseIssuer.MaxLicenses > 0}
                            {$licenseIssuer.MaxLicenses} maximum number of licenses
                        {:else}
                            Unlimited number of licenses
                        {/if}
                    </Tooltip>
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
                    id="new-product"
                    color="primary"
                    class="d-none d-sm-block text-nowrap"
                    on:click={toggleLicenseModal}
                >
                    New product
                </Button>
                <Button
                    id="new-product-plus"
                    color="primary"
                    class="d-sm-none"
                    on:click={toggleLicenseModal}
                >
                    <PlusLg style="min-width:1.2em;min-height:1.2em;" />
                </Button>
            </Col>
        </Row>

        <Container md>
            <Row class="mt-1 py-1 border-bottom border-2">
                <Col xs="8" class="fw-bolder">Name</Col>
                <Col xs="4" class="fw-bolder">Licenses</Col>
            </Row>
            {#each paginated as p, i (p?.ID)}
                <ProductRow {p} />
            {/each}
            {#if paginated.length === 0}
                <ProductRow empty />
            {/if}
            {#if filtered.length > perPage}
                {#each { length: (perPage - paginated.length) % perPage } as _}
                    <ProductRow placeholder />
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
    <DeleteModal
        isOpen={deleteModal}
        toggle={toggleDeleteModal}
        navigateTo="/license-issuers"
        {onDelete}
    />
    <ChangePasswd
        username={derived(licenseIssuer, (f) => f.Username)}
        isOpen={chpasswdModal}
        toggle={toggleChpasswdModal}
    />
    <ProductModal isOpen={licenseModal} toggle={toggleLicenseModal} />
</Container>
