<script lang="ts">
    import { navigate } from "svelte-navigator";
    import {
        Button,
        Modal,
        ModalFooter,
        ModalHeader,
        Spinner,
    } from "sveltestrap";

    import { deleteLicense } from "../util/license";
    import { license, licenseIssuer } from "../util/state";

    export let isOpen: boolean;
    export let toggle: () => void;

    let loading = false;

    const onDelete = async (e: Event) => {
        e.preventDefault();
        try {
            loading = true;
            const issuerID = $licenseIssuer.ID;
            const ok = await deleteLicense(issuerID, $license.ID);
            if (!ok) {
                return;
            }
            toggle();
            navigate(`/license-issuers/${issuerID}`);
        } finally {
            loading = false;
        }
    };
</script>

<Modal {isOpen} {toggle} scrollable>
    <ModalHeader {toggle}>Are you sure you want to delete?</ModalHeader>
    <ModalFooter>
        <Button color="secondary" outline on:click={toggle}>Cancel</Button>
        <Button color="danger" disabled={loading} on:click={onDelete}>
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            Delete
        </Button>
    </ModalFooter>
</Modal>
