<script lang="ts">
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
    } from "sveltestrap";
    import { newField } from "../util/field";
    import { usernameValidator } from "../util/validator";

    export let isOpen: boolean;
    export let toggle: () => void;
    export let privileged: boolean;

    const active = newField(false);
    const username = newField("", usernameValidator);
    const maxLicenses = newField(0);
    const maxLicensesUnlimited = newField(false);
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm">
    <Form on:submit>
        <ModalHeader {toggle}>Edit license issuer</ModalHeader>
        <ModalBody>
            <FormGroup>
                <Label for="username">Username</Label>
                <input
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
            {#if privileged}
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
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" outline on:click={toggle}>Cancel</Button>
            <Button color="primary" type="submit">Save</Button>
        </ModalFooter>
    </Form>
</Modal>
