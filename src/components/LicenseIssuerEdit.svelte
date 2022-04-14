<script lang="ts">
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
    import { editLicenseIssuer } from "../util/licenseIssuer";
    import { licenseIssuer } from "../util/state";
    import {
        emailValidator,
        maxLicenseValidator,
        phoneNumberValidator,
        usernameValidator,
    } from "../util/validator";

    export let isOpen: boolean;
    export let toggle: () => void;

    $: if (isOpen) {
        // onOpened
        active.reset($licenseIssuer.Active);
        username.reset($licenseIssuer.Username);
        email.reset($licenseIssuer.Email);
        phoneNumber.reset($licenseIssuer.PhoneNumber);
        maxLicenses.reset($licenseIssuer.MaxLicenses ? NaN : 1);
        maxLicensesUnlimited.reset($licenseIssuer.MaxLicenses <= 0);
        usernameInput?.focus();
    }

    let loading = false;
    const errorMsg = writable("");

    const active = newField(true);
    const username = newField("", usernameValidator);
    const email = newField("", emailValidator);
    const phoneNumber = newField("", phoneNumberValidator);
    const maxLicenses = newField(1, maxLicenseValidator);
    const maxLicensesUnlimited = newField(false);

    let usernameInput: HTMLInputElement;

    $: if ($maxLicensesUnlimited.value) {
        maxLicenses.update((f) => {
            f.errors = [];
            f.valid = true;
            f.invalid = false;
            return f;
        });
    } else {
        if (isNaN($maxLicenses.value)) {
            maxLicenses.reset();
        }
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
                      email,
                      phoneNumber,
                      maxLicenses: $maxLicensesUnlimited.value
                          ? undefined
                          : maxLicenses,
                      maxLicensesUnlimited,
                  }
                : { email, phoneNumber };

            const { values, ok } = validate(fields);
            if (!ok) {
                return;
            }

            const { licenseIssuer: li, status } = await editLicenseIssuer(
                $licenseIssuer.ID,
                $isPrivileged
                    ? {
                          active: values.active,
                          username: values.username,
                          email: values.email,
                          phoneNumber: values.phoneNumber,
                          maxLicenses: values.maxLicensesUnlimited
                              ? -1
                              : values.maxLicenses,
                      }
                    : {
                          email: values.email,
                          phoneNumber: values.phoneNumber,
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
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm" scrollable>
    <ModalHeader {toggle}>Edit license issuer</ModalHeader>
    <ModalBody>
        <Form id="license-issuer-edit" on:submit={onSubmit}>
            {#if $isPrivileged}
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
            {/if}
            <FormGroup>
                <Label for="email">
                    Email
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    id="email"
                    name="email"
                    placeholder="address@host.com"
                    type="email"
                    bind:value={$email.value}
                    on:focusout={email.validate}
                    class="form-control"
                    class:is-valid={$email.valid}
                    class:is-invalid={$email.invalid}
                />
                {#if $email.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $email.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="phoneNumber">
                    Phone number
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+370 xxx xxxxx"
                    type="text"
                    bind:value={$phoneNumber.value}
                    on:focusout={phoneNumber.validate}
                    class="form-control"
                    class:is-valid={$phoneNumber.valid}
                    class:is-invalid={$phoneNumber.invalid}
                />
                {#if $phoneNumber.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $phoneNumber.errors as err}
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
        </Form>
    </ModalBody>
    <ModalFooter>
        <Button color="secondary" outline on:click={toggle}>Cancel</Button>
        <Button
            color="primary"
            type="submit"
            form="license-issuer-edit"
            disabled={loading}
        >
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            Save
        </Button>
    </ModalFooter>
</Modal>
