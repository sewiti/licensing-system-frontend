<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import {
        Button,
        FormGroup,
        Input,
        Label,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Spinner,
    } from "sveltestrap";
    import {
        deleteLicenseSession,
        fetchLicenseSession,
    } from "../util/licenseSession";
    import { licenseSession } from "../util/state";
    import { getLang } from "../util/util";
    import Loader from "./Loader.svelte";

    const dispatch = createEventDispatcher();

    export let licenseIssuerID: number;
    export let licenseID: string;
    export let licenseSessionID: string;

    export let isOpen: boolean;
    export let toggle: () => void;

    let isOpenTerminate = false;

    let loading = true;
    let loadingAction = false; // e.g., terminate
    $: if (isOpen) {
        // onOpen
        loading = true;
        fetchLicenseSession(licenseIssuerID, licenseID, licenseSessionID)
            .then((ls) => licenseSession.set(ls))
            .finally(() => {
                loading = false;
            });
    }

    const toggleTerminate = (event?: MouseEvent) => {
        event?.preventDefault();
        toggle();
        isOpenTerminate = !isOpenTerminate;
    };
    const onTerminate = async (event: MouseEvent) => {
        event.preventDefault();
        loadingAction = true;
        try {
            const ok = await deleteLicenseSession(
                licenseIssuerID,
                licenseID,
                licenseSessionID
            );
            if (!ok) {
                return;
            }
            toggleTerminate();
            toggle();
            dispatch("terminate");
        } finally {
            loadingAction = false;
        }
    };
</script>

<Modal {isOpen} {toggle} fullscreen="sm" scrollable>
    <ModalHeader {toggle}>License session</ModalHeader>
    <ModalBody>
        <Loader {loading}>
            <FormGroup>
                <Label for="id">ID</Label>
                <Input
                    id="id"
                    class="font-monospace"
                    value={$licenseSession.ClientID}
                    disabled
                />
            </FormGroup>

            <FormGroup>
                <Label for="identifier">Identifier</Label>
                <Input
                    id="identifier"
                    value={$licenseSession.Identifier}
                    disabled
                />
            </FormGroup>

            <FormGroup>
                <Label for="appVersion">App version</Label>
                <Input
                    id="appVersion"
                    value={$licenseSession.AppVersion}
                    disabled
                />
            </FormGroup>

            <FormGroup>
                <Label for="machineID">Machine ID</Label>
                <Input
                    id="machineID"
                    class="font-monospace"
                    value={$licenseSession.MachineID}
                    disabled
                />
            </FormGroup>

            <FormGroup>
                <Label for="expires">Expires</Label>
                <Input
                    id="expires"
                    value={$licenseSession.Expire.toLocaleString(getLang())}
                    disabled
                />
            </FormGroup>

            <FormGroup>
                <Label for="created">Created</Label>
                <Input
                    id="created"
                    value={$licenseSession.Created.toLocaleString(getLang())}
                    disabled
                />
            </FormGroup>
        </Loader>
    </ModalBody>
    <ModalFooter class="justify-content-between">
        <Button
            id="terminate-session"
            color="danger"
            outline
            on:click={toggleTerminate}
        >
            Terminate
        </Button>
        <Button id="close-session" color="secondary" outline on:click={toggle}>
            Close
        </Button>
    </ModalFooter>
</Modal>
<Modal isOpen={isOpenTerminate} toggle={toggleTerminate} scrollable>
    <ModalHeader toggle={toggleTerminate}>
        Are you sure you want to terminate?
    </ModalHeader>
    <ModalFooter>
        <Button
            id="cancel-terminate"
            color="secondary"
            outline
            on:click={toggleTerminate}
        >
            Cancel
        </Button>
        <Button
            id="confirm-terminate"
            color="danger"
            disabled={loadingAction}
            on:click={onTerminate}
        >
            {#if loadingAction}
                <Spinner size="sm" role="status" />
            {/if}
            Terminate
        </Button>
    </ModalFooter>
</Modal>
