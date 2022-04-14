<script lang="ts">
    import { onMount } from "svelte";
    import {
        Badge,
        Button,
        ButtonDropdown,
        Col,
        Container,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        FormGroup,
        Input,
        Label,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Row,
    } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import { fetchLicense } from "../util/license";
    import { fetchLicenseIssuer } from "../util/licenseIssuer";
    import {
        fetchLicenseSessions,
        LicenseSession,
    } from "../util/licenseSession";
    import { license, licenseIssuer } from "../util/state";
    import PostcardFill from "svelte-bootstrap-icons/lib/PostcardFill";
    import Envelope from "svelte-bootstrap-icons/lib/Envelope";
    import HourglassTop from "svelte-bootstrap-icons/lib/HourglassTop";
    import HourglassSplit from "svelte-bootstrap-icons/lib/HourglassSplit";
    import HourglassBottom from "svelte-bootstrap-icons/lib/HourglassBottom";
    import LicenseSessionView from "../components/LicenseSessionView.svelte";
    import { derived } from "svelte/store";
    import LicenseModal from "../components/LicenseModal.svelte";
    import { getLang } from "../util/util";
    import LicenseDelete from "../components/LicenseDelete.svelte";
    import PageControl from "../components/PageControl.svelte";
    import { useFocus } from "svelte-navigator";
    import LicenseSessionRow from "../components/LicenseSessionRow.svelte";
    import { brand } from "../util/const";
    import Navbar from "../components/Navbar.svelte";

    export let licenseIssuerID: number;
    export let licenseID: string;

    const focus = useFocus();

    let copied = false;

    let isOpenViewKey = false;
    $: if (isOpenViewKey) {
        // onOpen
        copied = false;
    }
    const toggleViewKey = (event?: MouseEvent) => {
        event?.preventDefault();
        isOpenViewKey = !isOpenViewKey;
    };
    const onClickCopy = (event: MouseEvent) => {
        event.preventDefault();
        navigator.clipboard.writeText($license.Key);
        copied = true;
    };

    let isOpenViewSession = false;
    let selectedLicenseSessionID: string;
    const toggleViewSession = (event?: MouseEvent) => {
        event?.preventDefault();
        isOpenViewSession = !isOpenViewSession;
    };

    let loading = true;
    let licenseSessions: LicenseSession[] = [];

    $: loadData(licenseIssuerID, licenseID);

    const loadData = async (licenseIssuerID: number, licenseID: string) => {
        loading = true;
        license.set(await fetchLicense(licenseIssuerID, licenseID));
        licenseSessions = await fetchLicenseSessions(
            licenseIssuerID,
            licenseID
        );
        loading = false;
    };

    const onClickLicenseSession = (e: CustomEvent<{ id: string }>) => {
        selectedLicenseSessionID = e.detail.id;
        toggleViewSession();
    };
    onMount(async () => {
        if ($licenseIssuer.ID === undefined) {
            // Ensure breadcrumb is loaded ok - could happen on first load
            licenseIssuer.set(await fetchLicenseIssuer(licenseIssuerID));
        }
    });
    const onTerminate = () => {
        loadData(licenseIssuerID, licenseID);
    };

    const licenseValid = derived(
        license,
        (l) => l.ValidUntil === null || l.ValidUntil >= new Date()
    );

    let licenseModal = false;
    const toggleLicenseModal = (event?: MouseEvent) => {
        event?.preventDefault();
        licenseModal = !licenseModal;
    };
    let licenseDeleteModal = false;
    const toggleLicenseDeleteModal = (e?: Event) => {
        e?.preventDefault();
        licenseDeleteModal = !licenseDeleteModal;
    };

    let search: string = "";
    let filtered: LicenseSession[] = [];
    $: filtered = licenseSessions.filter((v) => {
        if (search === "") {
            return true;
        }
        if (v.Identifier.indexOf(search) >= 0) {
            return true;
        }
        if (v.AppVersion.indexOf(search) >= 0) {
            return true;
        }
        return false;
    });

    let paginated: LicenseSession[] = [];
    $: paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const perPage = 8;
    let page = 1;
</script>

<svelte:head>
    {#if loading}
        <title>{brand}</title>
    {:else if $license.Name === ""}
        <title>Unnamed license - {brand}</title>
    {:else}
        <title>{$license.Name} - {brand}</title>
    {/if}
</svelte:head>

<Container md>
    <Loader {loading}>
        <Breadcrumb active="license" />
        <Row>
            <Col xs="12" class="d-flex">
                <PostcardFill
                    class={$licenseValid ? "" : "text-secondary"}
                    style={"min-width:4em;min-height:4em;" +
                        ($licenseValid ? "color: rgb(58 77 135);" : "")}
                />
                <div class="mx-2">
                    <h4 class="mb-0">
                        {#if $license.Name !== ""}
                            {$license.Name}
                        {:else}
                            <span class="text-secondary fst-italic">
                                Unnamed license
                            </span>
                        {/if}
                        {#if $license.ValidUntil !== null && $license.ValidUntil < new Date()}
                            <Badge
                                class="align-middle"
                                style="font-size:small;"
                                color="secondary"
                            >
                                Expired
                            </Badge>
                        {/if}
                    </h4>
                    <div>
                        {#each $license.Tags as tag}
                            <Badge
                                class="me-1"
                                color={$licenseValid ? "primary" : "secondary"}
                                pill
                            >
                                {tag}
                            </Badge>
                        {/each}
                    </div>
                </div>
                <div class="flex-grow-1 text-end">
                    <ButtonDropdown>
                        <Button
                            color={$licenseValid ? "primary" : "secondary"}
                            class="text-nowrap"
                            on:click={toggleLicenseModal}
                            outline
                        >
                            Edit license
                        </Button>
                        <DropdownToggle
                            split
                            color={$licenseValid ? "primary" : "secondary"}
                            outline
                        />
                        <DropdownMenu end>
                            <DropdownItem on:click={toggleLicenseDeleteModal}>
                                Delete license
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                    <Button
                        color="primary"
                        class="d-none d-sm-inline"
                        on:click={toggleViewKey}
                    >
                        View key
                    </Button>
                </div>
            </Col>
            <Col xs="12" sm="5" md="4" lg="3" class="mt-2 pe-sm-1">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Info</h4>
                    {#if $license.EndUserEmail !== ""}
                        <div class="mb-1">
                            <Envelope />
                            <a
                                href={`mailto:${$license.EndUserEmail}`}
                                class="text-dark"
                            >
                                {$license.EndUserEmail}
                            </a>
                        </div>
                    {/if}
                    <div class="d-flex align-items-center">
                        {#if $license.ValidUntil !== null}
                            {#if $license.ValidUntil < new Date()}
                                <HourglassBottom class="me-1" />
                            {:else}
                                <HourglassSplit class="me-1" />
                            {/if}
                            {$license.ValidUntil.toLocaleString(getLang())}
                        {:else}
                            <HourglassTop class="me-1" />
                            <Badge color="success">No expiry</Badge>
                        {/if}
                    </div>
                </div>
            </Col>
            <Col xs="12" sm="7" md="8" lg="4" class="mt-2 ps-sm-1 pe-lg-1">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Note</h4>
                    {#if $license.Note !== ""}
                        <span>
                            {$license.Note}
                        </span>
                    {:else}
                        <span class="text-secondary fst-italic">No note</span>
                    {/if}
                </div>
            </Col>
            <Col xs="12" sm="12" lg="5" class="mt-2 ps-lg-1">
                <div class="p-2 border rounded-3 h-100">
                    <h4>Data</h4>
                    <span class="text-danger">TODO</span>
                </div>
            </Col>
            <Col xs="12" class="d-block d-sm-none mt-2">
                <Button color="primary" class="w-100" on:click={toggleViewKey}>
                    View key
                </Button>
            </Col>
        </Row>

        <Row>
            <Col
                class="mt-3 mb-1 d-flex align-items-center justify-content-between"
            >
                <div class="d-flex align-items-center">
                    <h4 class="mb-0 text-nowrap">Active sessions</h4>
                    <span
                        class="ms-2 me-3 align-bottom text-nowrap text-secondary"
                    >
                        {licenseSessions.length}
                        /
                        {$license.MaxSessions <= 0
                            ? "Unlimited"
                            : $license.MaxSessions}
                    </span>
                </div>
                <input
                    class="form-control"
                    style="max-width:15em;"
                    placeholder="Search"
                    bind:value={search}
                    use:focus
                />
            </Col>
        </Row>
        <!-- <div class="mt-3 mb-1 d-flex align-items-end justify-content-between">
            <h4 class="mb-0">Active license sessions</h4>
            
        </div> -->

        <!-- <Row>
            <Col class="my-2">
                <InputGroup>
                    <input
                        class="form-control"
                        placeholder="Search"
                        bind:value={search}
                        use:focus
                    />
                </InputGroup>
            </Col>
        </Row> -->
        <Container md>
            <Row class="mt-1 py-1 border-bottom border-2">
                <Col xs="5" sm="6" class="fw-bolder">Identifier</Col>
                <Col xs="3" sm="3" class="fw-bolder">App version</Col>
                <Col xs="4" sm="3" class="fw-bolder">Expires</Col>
            </Row>
            {#each paginated as ls, i (ls?.ClientID)}
                <LicenseSessionRow
                    {ls}
                    index={i}
                    on:click={onClickLicenseSession}
                />
            {/each}
            {#if paginated.length === 0}
                <LicenseSessionRow empty />
            {/if}
            {#if filtered.length > perPage}
                {#each { length: (perPage - paginated.length) % perPage } as _}
                    <LicenseSessionRow placeholder />
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

        <!-- <Table striped hover class="align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Identifier</th>
                    <th>Expires</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {#if licenseSessions.length === 0}
                    <tr>
                        <td colspan="5" class="text-center">
                            <span class="text-secondary fst-italic">
                                No license sessions
                            </span>
                        </td>
                    </tr>
                {:else}
                    {#each licenseSessions as ls (ls.ClientID)}
                        <tr
                            class="clickable"
                            on:click={() => onClickLicenseSession(ls.ClientID)}
                        >
                            <td class="font-monospace">
                                {ls.ClientID.substring(0, 6)}
                            </td>
                            <td>
                                {#if ls.Identifier !== ""}
                                    {limString(ls.Identifier, 32)}
                                {:else}
                                    <span class="text-secondary fst-italic">
                                        No identifier
                                    </span>
                                {/if}
                            </td>
                            <td>{ls.Expire.toLocaleString(getLang())}</td>
                            <td>{ls.Created.toLocaleString(getLang())}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </Table> -->
    </Loader>
    <Modal isOpen={isOpenViewKey} toggle={toggleViewKey} scrollable>
        <ModalHeader toggle={toggleViewKey}>View license key</ModalHeader>
        <ModalBody>
            <FormGroup>
                <Label for="licenseKeyBase64">Base64</Label>
                <Input
                    id="licenseKeyBase64"
                    class="font-monospace"
                    value={$license.Key}
                    disabled
                />
            </FormGroup>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" outline on:click={toggleViewKey}>
                Close
            </Button>
            <Button id="btn-copy" color="primary" on:click={onClickCopy}>
                {copied ? "Copied!" : "Copy"}
            </Button>
        </ModalFooter>
    </Modal>
    <LicenseSessionView
        isOpen={isOpenViewSession}
        {licenseID}
        {licenseIssuerID}
        licenseSessionID={selectedLicenseSessionID}
        toggle={toggleViewSession}
        on:terminate={onTerminate}
    />
    <LicenseModal edit isOpen={licenseModal} toggle={toggleLicenseModal} />
    <LicenseDelete
        isOpen={licenseDeleteModal}
        toggle={toggleLicenseDeleteModal}
    />
</Container>
