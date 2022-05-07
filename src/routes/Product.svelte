<script lang="ts">
    import { navigate, useFocus } from "svelte-navigator";
    import {
        Button,
        Container,
        Col,
        Row,
        ButtonDropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem,
        Badge,
        Tooltip,
    } from "sveltestrap";
    import {
        fetchLicenses,
        License,
        parseLicenseFields,
    } from "../util/license";
    import { licenseIssuer, product } from "../util/state";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import PlusLg from "svelte-bootstrap-icons/lib/PlusLg";
    import Envelope from "svelte-bootstrap-icons/lib/Envelope";
    import Window from "svelte-bootstrap-icons/lib/Window";
    import QuestionCircle from "svelte-bootstrap-icons/lib/QuestionCircle";
    import LicenseModal from "../components/LicenseModal.svelte";
    import PageControl from "../components/PageControl.svelte";
    import LicenseRow from "../components/LicenseRow.svelte";
    import { brand } from "../util/const";
    import { deleteProduct, fetchProduct, Product } from "../util/product";
    import ProductModal from "../components/ProductModal.svelte";
    import { onMount } from "svelte";
    import { fetchLicenseIssuer } from "../util/licenseIssuer";
    import DeleteModal from "../components/DeleteModal.svelte";
    import { derived } from "svelte/store";
    import CustomDataView from "../components/CustomDataView.svelte";

    export let licenseIssuerID: number;
    export let productID: number;
    $: loadData(licenseIssuerID, productID);
    let loading = true;
    let editModal = false;
    let deleteModal = false;
    let licenseModal = false;
    let licenses: License[] = [];

    let search: string = "";

    const focus = useFocus();

    let limitReached: boolean;
    $: limitReached =
        $licenseIssuer.MaxLicenses > 0 &&
        licenses.length >= $licenseIssuer.MaxLicenses;

    const loadData = async (licenseIssuerID: number, productID: number) => {
        loading = true;
        if (productID < 0) {
            product.set(<Product>{
                ID: -1,
                Name: "No product",
                Active: true,
                ContactEmail: "",
                Data: "",
            });
        } else {
            product.set(await fetchProduct(licenseIssuerID, productID));
        }
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
    const toggleLicenseModal = (event?: MouseEvent) => {
        event?.preventDefault();
        licenseModal = !licenseModal;
    };

    let productLicenses: License[] = [];
    $: productLicenses = licenses.filter(
        (v) => (v.ProductID || -1) === productID
    );

    let filtered: License[] = [];
    $: filtered = productLicenses.filter((v) => {
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

    const perPage = 10;
    let page = 1;

    onMount(async () => {
        if ($licenseIssuer.ID === undefined) {
            // Ensure breadcrumb is loaded ok - could happen on first load
            licenseIssuer.set(await fetchLicenseIssuer(licenseIssuerID));
        }
    });

    const onDelete = async (): Promise<boolean> => {
        return deleteProduct(licenseIssuerID, productID);
    };
</script>

<svelte:head>
    {#if loading}
        <title>{brand}</title>
    {:else if $product.Name === ""}
        <title>Unnamed product - {brand}</title>
    {:else}
        <title>{$product.Name} - {brand}</title>
    {/if}
</svelte:head>

<Container md>
    <Loader {loading}>
        <Breadcrumb active="product" />
        <Row>
            <Col xs="12" class="d-flex mb-1">
                <Window
                    class={$product.Active ? "" : "text-secondary"}
                    style={"min-width:4em;min-height:4em;" +
                        ($product.Active ? "color: rgb(58 77 135);" : "")}
                />
                <div class="mx-2">
                    <h4 class="mb-1">
                        {#if $product.ID < 0}
                            <span class="fst-italic text-secondary">
                                No product
                            </span>
                        {:else if $product.Name === ""}
                            <span class="fst-italic text-secondary">
                                Unnamed product
                            </span>
                        {:else}
                            <span>
                                {$product.Name}
                            </span>
                        {/if}
                        {#if !$product.Active}
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
                        <div id="edit-product-btn">
                            <Button
                                id="edit-product"
                                color={$product.Active
                                    ? "primary"
                                    : "secondary"}
                                disabled={$product.ID < 0}
                                class="text-nowrap"
                                style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
                                outline
                                on:click={toggleEditModal}
                            >
                                Edit product
                            </Button>
                        </div>
                        <DropdownToggle
                            id="product-dropdown"
                            split
                            color={$product.Active ? "primary" : "secondary"}
                            outline
                        />
                        <DropdownMenu end>
                            <div id="delete-product-btn">
                                <DropdownItem
                                    id="delete-product"
                                    disabled={$product.ID < 0}
                                    on:click={toggleDeleteModal}
                                >
                                    Delete product
                                </DropdownItem>
                            </div>
                        </DropdownMenu>
                        {#if $product.ID < 0}
                            <Tooltip target="edit-product-btn" placement="left">
                                Non-existent product cannot be edited
                            </Tooltip>
                            <Tooltip
                                target="delete-product-btn"
                                placement="left"
                            >
                                Non-existent product cannot be deleted
                            </Tooltip>
                        {/if}
                    </ButtonDropdown>
                </div>
            </Col>
            <Col xs="12" lg="5" class="mt-2 pe-lg-1">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Info</h4>
                    <div>
                        {#if $product.ContactEmail !== ""}
                            <Envelope />
                            <a
                                href={`mailto:${$product.ContactEmail}`}
                                class="text-dark"
                            >
                                {$product.ContactEmail}
                            </a>
                        {:else}
                            <span class="text-secondary fst-italic">
                                No contact information
                            </span>
                        {/if}
                    </div>
                </div>
            </Col>
            <Col xs="12" lg="7" class="mt-2 ps-lg-1">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Data</h4>
                    <CustomDataView data={parseLicenseFields($product.Data)} />
                </div>
            </Col>
        </Row>

        <Row>
            <Col class="mt-3 mb-1 d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <h4 class="mb-0 text-nowrap">Licenses</h4>
                    <span
                        id="licenses-count"
                        class="ms-2 me-3 align-bottom text-nowrap text-secondary d-flex align-items-center"
                    >
                        {productLicenses.length}
                        /
                        {licenses.length}
                        /
                        {$licenseIssuer.MaxLicenses <= 0
                            ? "Unlimited"
                            : $licenseIssuer.MaxLicenses}

                        <QuestionCircle class="ms-1 text-secondary" />
                    </span>
                    <Tooltip target="licenses-count" placement="bottom">
                        {productLicenses.length} licenses for this product<br />
                        {licenses.length} used licenses in total<br />
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
                <div id="new-license-btn">
                    <Button
                        id="new-license"
                        color="primary"
                        class="d-none d-sm-block text-nowrap"
                        disabled={limitReached}
                        on:click={toggleLicenseModal}
                    >
                        New license
                    </Button>
                </div>
                {#if limitReached}
                    <Tooltip target="new-license-btn" placement="bottom">
                        Limit reached
                    </Tooltip>
                {/if}
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
    <ProductModal edit isOpen={editModal} toggle={toggleEditModal} />
    <DeleteModal
        isOpen={deleteModal}
        toggle={toggleDeleteModal}
        {onDelete}
        navigateTo={`/license-issuers/${licenseIssuerID}`}
    />
    <LicenseModal
        isOpen={licenseModal}
        toggle={toggleLicenseModal}
        {productID}
    />
</Container>
