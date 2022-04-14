<script lang="ts">
    import {
        Button,
        Form,
        FormGroup,
        Label,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Spinner,
    } from "sveltestrap";
    import { changePasswd, isPrivileged } from "../util/auth";
    import { Readable, writable } from "svelte/store";
    import { newField, validate } from "../util/field";
    import { licenseIssuer } from "../util/state";
    import {
        newPasswordEntropyValidator,
        passwordConfirmValidator,
        passwordValidator,
    } from "../util/validator";

    export let username: Readable<string>;

    export let isOpen: boolean;
    export let toggle: () => void;

    $: if (isOpen) {
        // onOpened
        oldPasswd.reset();
        newPasswd.reset();
        confirmPasswd.reset();

        ($isPrivileged ? currentPasswdInput : oldPasswdInput)?.focus();
    }

    let loading = false;
    const errorMsg = writable("");

    const oldPasswd = newField("", passwordValidator);
    const newPasswd = newField("", newPasswordEntropyValidator(username));
    const confirmPasswd = newField("", passwordConfirmValidator(newPasswd));

    let oldPasswdInput: HTMLInputElement;
    let currentPasswdInput: HTMLInputElement;

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            errorMsg.set("");

            const fields = $isPrivileged
                ? {
                      newPasswd,
                      confirmPasswd,
                  }
                : {
                      oldPasswd,
                      newPasswd,
                      confirmPasswd,
                  };

            const { values, ok } = validate(fields);
            if (!ok) {
                return;
            }

            const { ok: reqOK, status } = await changePasswd(
                $licenseIssuer.ID,
                $isPrivileged
                    ? {
                          newPassword: values.newPasswd,
                      }
                    : {
                          oldPassword: values.oldPasswd,
                          newPassword: values.newPasswd,
                      }
            );
            if (status === 403) {
                oldPasswd.update((f) => {
                    f.errors = ["Password is incorrect"];
                    f.valid = false;
                    f.invalid = true;
                    return f;
                });
                return;
            }
            if (status === 400) {
                newPasswd.update((f) => {
                    f.errors = ["Password is too weak"];
                    f.valid = false;
                    f.invalid = true;
                    return f;
                });
                return;
            }
            if (!reqOK) {
                errorMsg.set(`Unexpected error occurred (${status})`);
                return;
            }
            toggle();
        } finally {
            loading = false;
        }
    };
</script>

<Modal {isOpen} {toggle} backdrop="static" scrollable>
    <ModalHeader {toggle}>Change password</ModalHeader>
    <ModalBody>
        <Form id="change-passwd" on:submit={onSubmit}>
            {#if !$isPrivileged}
                <FormGroup>
                    <Label for="oldPasswd">Current password</Label>
                    <input
                        bind:this={oldPasswdInput}
                        id="oldPasswd"
                        name="oldPasswd"
                        placeholder="Current password"
                        type="password"
                        bind:value={$oldPasswd.value}
                        on:focusout={oldPasswd.validate}
                        class="form-control"
                        class:is-valid={$oldPasswd.valid}
                        class:is-invalid={$oldPasswd.invalid}
                    />
                    {#if $oldPasswd.invalid}
                        <div class="invalid-feedback">
                            <ul>
                                {#each $oldPasswd.errors as err}
                                    <li>{err}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </FormGroup>
            {/if}
            <FormGroup>
                <Label for="newPasswd">New password</Label>
                <input
                    bind:this={currentPasswdInput}
                    id="newPasswd"
                    name="newPasswd"
                    placeholder="New password"
                    type="password"
                    bind:value={$newPasswd.value}
                    on:focusout={newPasswd.validate}
                    class="form-control"
                    class:is-valid={$newPasswd.valid}
                    class:is-invalid={$newPasswd.invalid}
                />
                {#if $newPasswd.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $newPasswd.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="confirmPasswd">Confirm password</Label>
                <input
                    id="confirmPasswd"
                    name="confirmPasswd"
                    placeholder="Confirm password"
                    type="password"
                    bind:value={$confirmPasswd.value}
                    on:focusout={confirmPasswd.validate}
                    class="form-control"
                    class:is-valid={$confirmPasswd.valid}
                    class:is-invalid={$confirmPasswd.invalid}
                />
                {#if $confirmPasswd.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $confirmPasswd.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            {#if $errorMsg !== ""}
                <div class="text-danger mt-1" style="font-size: .875em">
                    <ul class="mb-0">
                        <li>{$errorMsg}</li>
                    </ul>
                </div>
            {/if}
        </Form>
    </ModalBody>
    <ModalFooter>
        <Button color="secondary" outline on:click={toggle}>Cancel</Button>
        <Button
            color="primary"
            type="submit"
            form="change-passwd"
            disabled={loading}
        >
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            Save
        </Button>
    </ModalFooter>
</Modal>
