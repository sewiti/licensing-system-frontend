<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-navigator";
    import {
        Button,
        Col,
        Container,
        FormGroup,
        Input,
        Label,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Row,
        Table,
    } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import { fetchLicense } from "../util/license";
    import { fetchLicenseIssuer } from "../util/licenseIssuer";
    import {
        fetchLicenseSession,
        fetchLicenseSessions,
        LicenseSession,
    } from "../util/licenseSession";
    import { license, licenseIssuer, licenseSession } from "../util/state";

    import PencilFill from "svelte-bootstrap-icons/lib/PencilFill";
    import CardText from "svelte-bootstrap-icons/lib/CardText";
    import LicenseSessionView from "../components/LicenseSessionView.svelte";

    export let licenseIssuerID: number;
    export let licenseID: string;

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

    const limString = (s: string, maxLen: number): string => {
        if (s.length > maxLen) {
            return `${s.substring(0, maxLen)}…`;
        }
        return s;
    };
    const onClickLicenseSession = (licenseSessionID: string) => {
        selectedLicenseSessionID = licenseSessionID;
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
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb active="license" />
        <Row>
            <Col xs="12" sm="6" class="d-flex mb-1">
                <CardText width="4em" height="3.8em" />
                <div class="mx-2">
                    <h4 class="mb-0">License</h4>
                    <span class="text-secondary">
                        ID: <span class="font-monospace">
                            {$license.ID.substring(0, 6)}
                        </span>
                    </span>
                </div>
                <div class="flex-grow-1 flex-sm-grow-0 text-end text-sm-start">
                    <Button outline size="sm">
                        <PencilFill width="1em" height="1em" />
                    </Button>
                </div>
            </Col>
            <Col xs="6" class="text-end d-none d-sm-block">
                <Button color="primary" outline on:click={toggleViewKey}>
                    View key
                </Button>
            </Col>
            <Col xs="12">
                {$license.Note}
            </Col>
            <Col xs="12" class="d-block d-sm-none mt-2">
                <Button
                    color="primary"
                    class="w-100"
                    outline
                    on:click={toggleViewKey}
                >
                    View key
                </Button>
            </Col>
        </Row>

        <div class="mt-3 mb-1 d-flex align-items-end justify-content-between">
            <h4 class="mb-0">License sessions</h4>
            <span class="align-bottom text-secondary">
                {licenseSessions.length}
                /
                {$license.MaxSessions <= 0 ? "Unlimited" : $license.MaxSessions}
            </span>
        </div>

        <Table striped hover class="align-middle">
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
                            <td>{ls.Expire.toLocaleString()}</td>
                            <td>{ls.Created.toLocaleString()}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </Table>
    </Loader>
    <Modal isOpen={isOpenViewKey} toggle={toggleViewKey}>
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
            <Button color="primary" outline={!copied} on:click={onClickCopy}>
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
</Container>
