<script lang="ts">
    import { onDestroy } from "svelte";

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
    import { newField, validate } from "../util/field";
    import { createLicenseIssuer } from "../util/licenseIssuer";
    import {
        maxLicenseValidator,
        newPasswordEntropyValidator,
        usernameValidator,
    } from "../util/validator";

    export let isOpen: boolean;
    export let toggle: () => void;

    $: if (isOpen) {
        // onOpened
        username.reset();
        password.reset();
        maxLicenses.reset();
        maxLicensesUnlimited.reset();
        usernameInput?.focus();
    }

    let loading = false;
    const errorMsg = writable("");

    const username = newField("", usernameValidator);
    const password = newField("", newPasswordEntropyValidator(username));
    const maxLicenses = newField(1, maxLicenseValidator);
    const maxLicensesUnlimited = newField(false);

    let usernameInput: HTMLInputElement;

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            errorMsg.set("");

            const { values, ok } = validate({
                username,
                password,
                maxLicenses,
                maxLicensesUnlimited,
            });
            if (!ok) {
                return;
            }

            const { licenseIssuer: li, status } = await createLicenseIssuer({
                active: true,
                username: values.username,
                password: values.password,
                maxLicenses: values.maxLicensesUnlimited
                    ? -1
                    : values.maxLicenses,
            });
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
                errorMsg.set("Unable to create license issuer");
                return;
            }
            toggle();
            navigate(`/license-issuers/${li.ID}`);
        } finally {
            loading = false;
        }
    };
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm">
    <Form on:submit={onSubmit}>
        <ModalHeader {toggle}>Create license issuer</ModalHeader>
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
            <FormGroup>
                <Label for="password">Password</Label>
                <input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type="password"
                    bind:value={$password.value}
                    on:focusout={password.validate}
                    class="form-control"
                    class:is-valid={$password.valid}
                    class:is-invalid={$password.invalid}
                />
                {#if $password.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $password.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
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
            {#if $errorMsg !== ""}
                <div class="text-danger mt-1" style="font-size: .875em">
                    <ul class="mb-0">
                        <li>{$errorMsg}</li>
                    </ul>
                </div>
            {/if}
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" outline on:click={toggle}>Cancel</Button>
            <Button color="primary" type="submit" disabled={loading}>
                {#if loading}
                    <Spinner size="sm" role="status" />
                {/if}
                Create
            </Button>
        </ModalFooter>
    </Form>
</Modal>
