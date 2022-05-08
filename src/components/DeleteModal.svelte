<script lang="ts">
    import { navigate } from "svelte-navigator";
    import {
        Button,
        Modal,
        ModalFooter,
        ModalHeader,
        Spinner,
    } from "sveltestrap";
    import { modalFade } from "../util/const";

    export let isOpen: boolean = false;
    export let toggle: () => void = () => {
        isOpen = !isOpen;
    };
    export let onDelete: () => Promise<boolean>;
    export let navigateTo: string = "/";

    let loading = false;
    let deleted = false;

    const onClickDelete = async (event: MouseEvent) => {
        event.preventDefault();
        try {
            loading = true;
            const ok = await onDelete();
            if (ok) {
                deleted = true;
            }
        } finally {
            loading = false;
        }
    };

    const onClose = (e?: Event) => {
        e?.preventDefault();
        if (deleted) {
            navigate(navigateTo);
        }
    };
</script>

<Modal
    isOpen={isOpen && !deleted}
    {toggle}
    on:close={onClose}
    scrollable
    fade={modalFade}
>
    <ModalHeader {toggle}>Are you sure you want to delete?</ModalHeader>
    <ModalFooter>
        <Button id="cancel-delete" color="secondary" outline on:click={toggle}>
            Cancel
        </Button>
        <Button
            id="confirm-delete"
            color="danger"
            disabled={loading}
            on:click={onClickDelete}
        >
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            Delete
        </Button>
    </ModalFooter>
</Modal>
