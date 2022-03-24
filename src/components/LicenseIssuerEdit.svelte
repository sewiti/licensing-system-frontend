<script lang="ts">
    import { navigate } from "svelte-navigator";
    import { writable } from "svelte/store";
    import {
        Button,
        Form,
        FormGroup,
        Input,
        InputGroup,
        InputGroupText,
        Label,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Spinner,
    } from "sveltestrap";
    import { isPrivileged } from "../util/auth";
    import { newField, validate } from "../util/field";
    import {
        deleteLicenseIssuer,
        editLicenseIssuer,
    } from "../util/licenseIssuer";
    import { licenseIssuer } from "../util/state";
    import { maxLicenseValidator, usernameValidator } from "../util/validator";

    export let isOpen: boolean;
    export let toggle: () => void;

    let isOpenDelete: boolean = false;

    $: if (isOpen) {
        // onOpened
        active.reset($licenseIssuer.Active);
        username.reset($licenseIssuer.Username);
        maxLicenses.reset(Math.max($licenseIssuer.MaxLicenses, 1));
        maxLicensesUnlimited.reset($licenseIssuer.MaxLicenses <= 0);
        usernameInput?.focus();
    }

    let loading = false;
    const errorMsg = writable("");

    const active = newField(true);
    const username = newField("", usernameValidator);
    const maxLicenses = newField(1, maxLicenseValidator);
    const maxLicensesUnlimited = newField(false);

    let usernameInput: HTMLInputElement;

    $: if ($maxLicensesUnlimited.value) {
        maxLicenses.update((f) => {
            f.value = 1;
            return f;
        });
        maxLicenses.validate();
    }

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            errorMsg.set("");

            const fields = $isPrivileged
                ? {
                      active,
                      username,
                      maxLicenses,
                      maxLicensesUnlimited,
                  }
                : { username };

            const { values, ok } = validate(fields);
            if (!ok) {
                return;
            }

            const { licenseIssuer: li, status } = await editLicenseIssuer(
                $licenseIssuer.ID,
                {
                    active: values.active,
                    username: values.username,
                    maxLicenses: values.maxLicensesUnlimited
                        ? -1
                        : values.maxLicenses,
                }
            );
            if (li === null) {
                if (status === 409) {
                    username.update((f) => {
                        f.errors = ["Username is taken"];
                        f.valid = false;
                        f.invalid = true;
                        return f;
                    });
                    return;
                }
                errorMsg.set("Unable to edit license issuer");
                return;
            }
            licenseIssuer.set(li);
            toggle();
        } finally {
            loading = false;
        }
    };
    const onDelete = async (event: MouseEvent) => {
        event.preventDefault();
        try {
            loading = true;

            const ok = await deleteLicenseIssuer($licenseIssuer.ID);
            if (!ok) {
                return;
            }
            toggleDelete();
            toggle();
            navigate("/license-issuers");
        } finally {
            loading = false;
        }
    };
    const toggleDelete = (event?: MouseEvent) => {
        event?.preventDefault();
        toggle();
        isOpenDelete = !isOpenDelete;
    };
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm">
    <Form on:submit={onSubmit}>
        <ModalHeader {toggle}>Edit license issuer</ModalHeader>
        <ModalBody>
            <FormGroup>
                <Label for="username">Username</Label>
                <input
                    bind:this={usernameInput}
                    id="username"
                    name="username"
                    placeholder="Username"
                    type="text"
                    bind:value={$username.value}
                    on:focusout={username.validate}
                    class="form-control"
                    class:is-valid={$username.valid}
                    class:is-invalid={$username.invalid}
                />
                {#if $username.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $username.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            {#if $isPrivileged}
                <FormGroup>
                    <Label for="maxLicenses">Max licenses</Label>
                    <InputGroup>
                        <input
                            id="maxLicenses"
                            name="maxLicenses"
                            placeholder="Max licenses"
                            type="number"
                            step="1"
                            disabled={$maxLicensesUnlimited.value}
                            bind:value={$maxLicenses.value}
                            on:focusout={maxLicenses.validate}
                            class="form-control"
                            class:is-valid={$maxLicenses.valid}
                            class:is-invalid={$maxLicenses.invalid}
                        />
                        <InputGroupText>
                            <Input
                                id="maxLicensesUnlimited"
                                name="maxLicensesUnlimited"
                                type="checkbox"
                                label="Unlimited"
                                bind:checked={$maxLicensesUnlimited.value}
                            />
                        </InputGroupText>
                        {#if $maxLicenses.invalid}
                            <div class="invalid-feedback">
                                <ul>
                                    {#each $maxLicenses.errors as err}
                                        <li>{err}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <Input
                        id="active"
                        name="active"
                        type="switch"
                        label="Active"
                        bind:checked={$active.value}
                    >
                        Active
                    </Input>
                </FormGroup>
            {/if}
            {#if $errorMsg !== ""}
                <div class="text-danger mt-1" style="font-size: .875em">
                    <ul class="mb-0">
                        <li>{$errorMsg}</li>
                    </ul>
                </div>
            {/if}
        </ModalBody>
        <ModalFooter class="justify-content-between">
            <div>
                {#if $isPrivileged}
                    <Button color="danger" outline on:click={toggleDelete}>
                        Delete
                    </Button>
                {/if}
            </div>
            <div>
                <Button color="secondary" outline on:click={toggle}>
                    Cancel
                </Button>
                <Button color="primary" type="submit" disabled={loading}>
                    {#if loading}
                        <Spinner size="sm" role="status" />
                    {/if}
                    Save
                </Button>
            </div>
        </ModalFooter>
    </Form>
</Modal>
<Modal isOpen={isOpenDelete} toggle={toggleDelete}>
    <ModalHeader toggle={toggleDelete}>
        Are you sure you want to delete?
    </ModalHeader>
    <ModalFooter>
        <Button color="secondary" outline on:click={toggleDelete}>
            Cancel
        </Button>
        <Button color="danger" disabled={loading} on:click={onDelete}>
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            Delete
        </Button>
    </ModalFooter>
</Modal>
