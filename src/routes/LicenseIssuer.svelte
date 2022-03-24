<script lang="ts">
    import { navigate } from "svelte-navigator";
    import { Button, Container, Table, Tooltip, Col, Row } from "sveltestrap";
    import { fetchLicenses, License } from "../util/license";
    import { fetchLicenseIssuer } from "../util/licenseIssuer";
    import { licenseIssuer } from "../util/state";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import Person from "svelte-bootstrap-icons/lib/Person";
    import PencilFill from "svelte-bootstrap-icons/lib/PencilFill";
    import ShieldShaded from "svelte-bootstrap-icons/lib/ShieldShaded";
    import LicenseIssuerEdit from "../components/LicenseIssuerEdit.svelte";

    export let licenseIssuerID: number;
    $: loadData(licenseIssuerID);
    let loading = true;
    let editModal = false;
    let licenses: License[] = [];

    let limitReached: boolean;
    $: limitReached =
        $licenseIssuer.MaxLicenses > 0 &&
        licenses.length >= $licenseIssuer.MaxLicenses;

    const loadData = async (licenseIssuerID: number) => {
        loading = true;
        licenseIssuer.set(await fetchLicenseIssuer(licenseIssuerID));
        licenses = await fetchLicenses(licenseIssuerID);
        loading = false;
    };
    const limString = (s: string, maxLen: number): string => {
        if (s.length > maxLen) {
            return `${s.substring(0, maxLen)}…`;
        }
        return s;
    };
    const onClickLicense = (licenseID: string) => {
        const _licenseID = licenseID.replace("/", "_").replace("+", "-");
        navigate(`/license-issuers/${licenseIssuerID}/licenses/${_licenseID}`);
    };
    const toggleEditModal = (event?: MouseEvent) => {
        event?.preventDefault();
        editModal = !editModal;
    };
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb active="license-issuer" />
        <Row>
            <Col xs="12" sm="6" class="d-flex mb-1">
                <Person width="4em" height="4em" />
                <div class="mx-2">
                    <h4 class="mb-0">
                        {$licenseIssuer.Username}
                        {#if $licenseIssuer.ID === 0}
                            <ShieldShaded />
                        {/if}
                    </h4>
                    <span class="text-secondary">ID: {$licenseIssuer.ID}</span>
                </div>
                <div class="flex-grow-1 flex-sm-grow-0 text-end text-sm-start">
                    <div
                        id="edit-license-issuer-wrapper"
                        class="d-inline-block mx-1"
                    >
                        <Button
                            outline
                            size="sm"
                            disabled={$licenseIssuer.ID === 0}
                            on:click={toggleEditModal}
                        >
                            <PencilFill width="1em" height="1em" />
                        </Button>
                    </div>
                    {#if $licenseIssuer.ID === 0}
                        <Tooltip
                            target="edit-license-issuer-wrapper"
                            placement="right"
                            animation
                        >
                            {$licenseIssuer.Username} is immutable
                        </Tooltip>
                    {/if}
                </div>
            </Col>
            <Col xs="12" sm="6" class="text-end">
                <Button
                    color="primary"
                    class="d-none d-sm-inline"
                    outline
                    disabled={limitReached}
                >
                    New license
                </Button>
                <Button
                    color="primary"
                    class="d-block w-100 d-sm-none"
                    outline
                    disabled={limitReached}
                >
                    New license
                </Button>
            </Col>
        </Row>
        <div class="mt-3 mb-1 d-flex align-items-end justify-content-between">
            <h4 class="mb-0">Licenses</h4>
            <span class="align-bottom text-secondary">
                {licenses.length}
                /
                {$licenseIssuer.MaxLicenses <= 0
                    ? "Unlimited"
                    : $licenseIssuer.MaxLicenses}
            </span>
        </div>
        <Table striped hover class="align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Note</th>
                    <th>Max sessions</th>
                    <th>Expires</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {#if licenses.length === 0}
                    <tr>
                        <td colspan="5" class="text-center">
                            <span class="text-secondary fst-italic">
                                No licenses
                            </span>
                        </td>
                    </tr>
                {:else}
                    {#each licenses as l (l.ID)}
                        <tr
                            class="clickable"
                            on:click={() => onClickLicense(l.ID)}
                        >
                            <td class="font-monospace">
                                {l.ID.substring(0, 6)}
                            </td>
                            <td>
                                {#if l.Note !== ""}
                                    {limString(l.Note, 32)}
                                {:else}
                                    <span class="text-secondary fst-italic">
                                        No note
                                    </span>
                                {/if}
                            </td>
                            <td>{l.MaxSessions}</td>
                            <td>
                                {#if l.ValidUntil !== null}
                                    {l.ValidUntil.toLocaleDateString()}
                                {:else}
                                    <span class="text-secondary fst-italic">
                                        No expiry
                                    </span>
                                {/if}
                            </td>
                            <td>{l.Created.toLocaleDateString()}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </Table>
    </Loader>
    <LicenseIssuerEdit isOpen={editModal} toggle={toggleEditModal} />
</Container>
