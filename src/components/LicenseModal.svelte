<script lang="ts">
    import { writable } from "svelte/store";
    import { newField, validate } from "../util/field";
    import { license, licenseIssuer, product } from "../util/state";
    import { addDays, formatDatetime, nextMidnight } from "../util/datetime";
    import DataField from "./DataField.svelte";
    import { navigate } from "svelte-navigator";
    import { urlBase64 } from "../util/util";
    import InfoCircle from "svelte-bootstrap-icons/lib/InfoCircle";
    import {
        Button,
        Form,
        FormGroup,
        Input,
        InputGroup,
        InputGroupText,
        Label,
        Modal,
        ModalFooter,
        ModalHeader,
        Spinner,
        Tooltip,
    } from "sveltestrap";
    import {
        emailValidator,
        licenseDataFieldsValidator,
        licenseNameValidator,
        licenseNoteValidator,
        licenseTagsValidator,
        maxSessionsValidator,
        validUntilValidator,
    } from "../util/validator";
    import ExclamationTriangleFill from "svelte-bootstrap-icons/lib/ExclamationTriangleFill";
    import {
        createLicense,
        updateLicense,
        formatTags,
        LicenseDataField,
        parseLicenseFields,
        formatLicenseFields,
        parseTags,
    } from "../util/license";

    export let productID: number = -1;

    export let edit: boolean = false;

    export let isOpen: boolean;
    export let toggle: () => void;

    let parsedFields = false;

    let modalBody: HTMLElement;

    $: if (isOpen) {
        // onOpened
        const parsedLicenseFields = edit
            ? parseLicenseFields($license.Data)
            : [];
        parsedFields = parsedLicenseFields !== null;

        active.reset(edit ? $license.Active : undefined);
        name.reset(edit ? $license.Name : undefined);
        note.reset(edit ? $license.Note : undefined);
        maxSessions.reset(edit ? $license.MaxSessions : undefined);
        validUntil.reset(
            edit ? formatDatetime($license.ValidUntil) : undefined
        );
        validUntilUnlimited.reset(
            edit ? $license.ValidUntil === null : undefined
        );
        tags.reset(edit ? formatTags($license.Tags) : undefined);
        endUserEmail.reset(edit ? $license.EndUserEmail : undefined);
        fields.reset(edit ? parsedLicenseFields || [] : undefined);
        nameInput?.focus();
    }

    $: if ($validUntilUnlimited.value) {
        validUntil.update((f) => {
            f.errors = [];
            f.valid = true;
            f.invalid = false;
            return f;
        });
    } else {
        if (isNaN(Date.parse($validUntil.value))) {
            validUntil.reset();
        }
        validUntil.validate();
    }

    let loading = false;
    const errorMsg = writable("");

    const active = newField(true);
    const name = newField("", licenseNameValidator);
    const tags = newField("", licenseTagsValidator);
    const endUserEmail = newField("", emailValidator);
    const note = newField("", licenseNoteValidator);
    const maxSessions = newField(1, maxSessionsValidator);
    const validUntil = newField(
        formatDatetime(nextMidnight(addDays(new Date(), 29))),
        validUntilValidator
    );
    const validUntilUnlimited = newField(false);
    const fields = newField<LicenseDataField[]>([], licenseDataFieldsValidator);
    const addField = (event?: Event) => {
        event?.preventDefault();
        fields.update((v) => {
            v.value = [
                ...v.value,
                <LicenseDataField>{
                    _id: Math.random(),
                },
            ];
            return v;
        });
    };
    const deleteField = (i: number) => {
        fields.update((v) => {
            v.value = v.value.filter((_, j) => j !== i);
            return v;
        });
        fields.validate();
    };

    let nameInput: HTMLInputElement;

    const onSubmit = async (event: Event) => {
        event.preventDefault();
        try {
            loading = true;
            errorMsg.set("");

            const { values, ok } = validate({
                active,
                name,
                tags,
                endUserEmail,
                note,
                maxSessions,
                validUntil: $validUntilUnlimited.value ? undefined : validUntil,
                validUntilUnlimited,
                fields,
            });
            if (!ok) {
                return;
            }
            const uploadData = parsedFields || (values.fields || []).length > 0;

            const reqFields = {
                active: values.active,
                name: values.name,
                tags: parseTags(values.tags),
                endUserEmail: values.endUserEmail,
                note: values.note,
                maxSessions: values.maxSessions,
                validUntil: values.validUntilUnlimited
                    ? null
                    : new Date(values.validUntil),
                data: uploadData
                    ? formatLicenseFields(values.fields)
                    : undefined,
                productID: productID < 0 ? null : productID,
            };

            const { license: l, status } = edit
                ? await updateLicense($licenseIssuer.ID, $license.ID, reqFields)
                : await createLicense($licenseIssuer.ID, reqFields);
            if (l === null) {
                errorMsg.set(
                    `Unable to ${
                        edit ? "update" : "create"
                    } license (${status})`
                );
                return;
            }
            toggle();
            if (edit) {
                license.set(l);
            } else {
                const _licenseID = urlBase64(l.ID);
                navigate(
                    `/license-issuers/${$licenseIssuer.ID}/products/${$product.ID}/licenses/${_licenseID}`
                );
            }
        } finally {
            loading = false;
        }
    };
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm" scrollable>
    <ModalHeader {toggle}>{edit ? "Edit" : "Create"} license</ModalHeader>
    <div class="modal-body" bind:this={modalBody}>
        <Form id="licenseForm" on:submit={onSubmit}>
            <FormGroup>
                <Label for="name">
                    Name
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    bind:this={nameInput}
                    id="name"
                    name="name"
                    placeholder="License name"
                    type="text"
                    bind:value={$name.value}
                    on:focusout={name.validate}
                    class="form-control"
                    class:is-valid={$name.valid}
                    class:is-invalid={$name.invalid}
                />
                {#if $name.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $name.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="tags">
                    Tags
                    <span class="text-secondary">
                        (optional)
                        <InfoCircle id="tagsInfo" />
                        <Tooltip target="tagsInfo" placement="right">
                            Separated by semicolon, e.g.,
                            <span class="fst-italic">
                                {formatTags(["first tag", "second tag"])}
                            </span>
                        </Tooltip>
                    </span>
                </Label>
                <input
                    id="tags"
                    name="tags"
                    placeholder="Tags"
                    type="text"
                    bind:value={$tags.value}
                    on:focusout={tags.validate}
                    class="form-control"
                    class:is-valid={$tags.valid}
                    class:is-invalid={$tags.invalid}
                />
                {#if $tags.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $tags.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="endUserEmail">
                    End-user email
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    id="endUserEmail"
                    name="endUserEmail"
                    placeholder="End-user email"
                    type="text"
                    bind:value={$endUserEmail.value}
                    on:focusout={endUserEmail.validate}
                    class="form-control"
                    class:is-valid={$endUserEmail.valid}
                    class:is-invalid={$endUserEmail.invalid}
                />
                {#if $endUserEmail.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $endUserEmail.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="note">
                    Note
                    <span class="text-secondary">(optional)</span>
                </Label>
                <textarea
                    id="note"
                    name="note"
                    placeholder="Note"
                    rows="3"
                    bind:value={$note.value}
                    on:focusout={note.validate}
                    class="form-control"
                    class:is-valid={$note.valid}
                    class:is-invalid={$note.invalid}
                />
                {#if $note.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $note.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="maxSessions">Max sessions</Label>
                <input
                    id="maxSessions"
                    name="maxSessions"
                    placeholder="Max sessions"
                    type="number"
                    step="1"
                    bind:value={$maxSessions.value}
                    on:focusout={maxSessions.validate}
                    class="form-control"
                    class:is-valid={$maxSessions.valid}
                    class:is-invalid={$maxSessions.invalid}
                />
                {#if $maxSessions.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $maxSessions.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="validUntil">Expires</Label>
                <InputGroup>
                    <input
                        id="validUntil"
                        name="validUntil"
                        placeholder="Expires"
                        type="datetime-local"
                        disabled={$validUntilUnlimited.value}
                        bind:value={$validUntil.value}
                        on:focusout={validUntil.validate}
                        class="form-control"
                        class:is-valid={$validUntil.valid}
                        class:is-invalid={$validUntil.invalid}
                    />
                    <InputGroupText>
                        <Input
                            id="validUntilUnlimited"
                            name="validUntilUnlimited"
                            type="checkbox"
                            label="No expiry"
                            bind:checked={$validUntilUnlimited.value}
                        />
                    </InputGroupText>
                    {#if $validUntil.invalid}
                        <div class="invalid-feedback">
                            <ul>
                                {#each $validUntil.errors as err}
                                    <li>{err}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </InputGroup>
            </FormGroup>
            <button hidden type="submit" />
            <FormGroup>
                <Label id="dataLabel">
                    Data
                    {#if !parsedFields}
                        <ExclamationTriangleFill class="text-warning" />
                        <Tooltip target="dataLabel" placement="right">
                            <span class="text-warning">
                                Unable to parse current data, changing data will
                                overwrite it.
                            </span>
                        </Tooltip>
                    {/if}
                </Label>
                {#each $fields.value || [] as f, i (f._id)}
                    <DataField
                        bind:field={f.field}
                        bind:value={f.value}
                        on:delete={() => {
                            deleteField(i);
                        }}
                        on:focusout={fields.validate}
                    />
                {/each}
                {#if $fields.invalid}
                    <div class="text-danger mt-1" style="font-size: .875em">
                        <ul class="mb-0">
                            {#each $fields.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
                <div>
                    <a
                        href="/"
                        id="add-field"
                        class="link-primary mt-1"
                        on:click={addField}
                    >
                        Add field
                    </a>
                </div>
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
            {#if $errorMsg !== ""}
                <div class="text-danger mt-1" style="font-size: .875em">
                    <ul class="mb-0">
                        <li>{$errorMsg}</li>
                    </ul>
                </div>
            {/if}
        </Form>
    </div>
    <ModalFooter>
        <Button id="cancel-license" color="secondary" outline on:click={toggle}>
            Cancel
        </Button>
        <Button
            id="save-license"
            color="primary"
            type="submit"
            disabled={loading}
            form="licenseForm"
        >
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            {edit ? "Save" : "Create"}
        </Button>
    </ModalFooter>
</Modal>
