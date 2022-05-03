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
        productNameValidator,
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
    import { createProduct, updateProduct } from "../util/product";

    export let edit: boolean = false;

    export let isOpen: boolean;
    export let toggle: () => void;

    let parsedFields = false;

    let modalBody: HTMLElement;

    $: if (isOpen) {
        // onOpened
        const parsedLicenseFields = edit
            ? parseLicenseFields($product.Data)
            : [];
        parsedFields = parsedLicenseFields !== null;

        active.reset(edit ? $product.Active : undefined);
        name.reset(edit ? $product.Name : undefined);
        contactEmail.reset(edit ? $product.ContactEmail : undefined);
        fields.reset(edit ? parsedLicenseFields || [] : undefined);
        nameInput?.focus();
    }

    let loading = false;
    const errorMsg = writable("");

    const active = newField(true);
    const name = newField("", productNameValidator);
    const contactEmail = newField("", emailValidator);
    const fields = newField<LicenseDataField[]>([], licenseDataFieldsValidator);
    const addField = (event?: Event) => {
        event?.preventDefault();
        fields.update((v) => {
            v.value = [...v.value, <LicenseDataField>{}];
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
                contactEmail,
                fields,
            });
            if (!ok) {
                return;
            }
            const uploadData = parsedFields || (values.fields || []).length > 0;

            const reqFields = {
                active: values.active,
                name: values.name,
                contactEmail: values.contactEmail,
                data: uploadData
                    ? formatLicenseFields(values.fields)
                    : undefined,
            };

            const { product: p, status } = edit
                ? await updateProduct($licenseIssuer.ID, $product.ID, reqFields)
                : await createProduct($licenseIssuer.ID, reqFields);
            if (p === null) {
                errorMsg.set(
                    `Unable to ${
                        edit ? "update" : "create"
                    } product (${status})`
                );
                return;
            }
            toggle();
            if (edit) {
                product.set(p);
            } else {
                navigate(
                    `/license-issuers/${$licenseIssuer.ID}/products/${p.ID}`
                );
            }
        } finally {
            loading = false;
        }
    };
</script>

<Modal {isOpen} {toggle} backdrop="static" fullscreen="sm" scrollable>
    <ModalHeader {toggle}>{edit ? "Edit" : "Create"} product</ModalHeader>
    <div class="modal-body" bind:this={modalBody}>
        <Form id="productForm" on:submit={onSubmit}>
            <FormGroup>
                <Label for="name">
                    Name
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    bind:this={nameInput}
                    id="name"
                    name="name"
                    placeholder="Product name"
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
                <Label for="contactEmail">
                    Contact email
                    <span class="text-secondary">(optional)</span>
                </Label>
                <input
                    id="contactEmail"
                    name="contactEmail"
                    placeholder="Contact email"
                    type="text"
                    bind:value={$contactEmail.value}
                    on:focusout={contactEmail.validate}
                    class="form-control"
                    class:is-valid={$contactEmail.valid}
                    class:is-invalid={$contactEmail.invalid}
                />
                {#if $contactEmail.invalid}
                    <div class="invalid-feedback">
                        <ul>
                            {#each $contactEmail.errors as err}
                                <li>{err}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </FormGroup>
            <button hidden type="submit" />
            <FormGroup>
                <Label id="dataLabel">
                    Product data
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
                {#each $fields.value || [] as f, i}
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
                    <a href="/" class="link-primary mt-1" on:click={addField}>
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
        <Button color="secondary" outline on:click={toggle}>Cancel</Button>
        <Button
            color="primary"
            type="submit"
            disabled={loading}
            form="productForm"
        >
            {#if loading}
                <Spinner size="sm" role="status" />
            {/if}
            {edit ? "Save" : "Create"}
        </Button>
    </ModalFooter>
</Modal>
