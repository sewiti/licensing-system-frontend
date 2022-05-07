<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Button, Col, Input, Row } from "sveltestrap";
    import Trash from "svelte-bootstrap-icons/lib/Trash";

    export let field: string = "";
    export let value: string | number | boolean = "";
    let type: "string" | "number" | "boolean" = typeof value as
        | "string"
        | "number"
        | "boolean";

    let textValue = (value as string) || "";
    let numberValue = (value as number) || 0;
    let boolValue = (value as boolean) ? "true" : "false" || "false";

    $: switch (type) {
        case "string": {
            value = textValue;
            break;
        }
        case "number": {
            value = numberValue;
            break;
        }
        case "boolean": {
            value = boolValue === "true";
            break;
        }
    }

    const dispatch = createEventDispatcher();
    const onDelete = (event: Event) => {
        event.preventDefault();
        dispatch("delete");
    };
</script>

<Row class="data-field mb-2">
    <Col xs="4" class="pe-1">
        <input
            class="data-field-key form-control"
            placeholder="Field"
            type="text"
            bind:value={field}
            on:focusout
        />
    </Col>

    <Col xs="4" class="ps-0 pe-1">
        {#if type === "string"}
            <Input
                bind:value={textValue}
                class="data-field-value-text"
                placeholder="Value"
                type="text"
            />
        {:else if type === "number"}
            <Input
                bind:value={numberValue}
                class="data-field-value-number"
                placeholder="Value"
                type="number"
                step="0.001"
            />
        {:else if type === "boolean"}
            <Input
                bind:value={boolValue}
                class="data-field-value-bool"
                placeholder="Value"
                type="select"
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </Input>
        {/if}
    </Col>

    <Col xs="4" class="ps-0 d-flex">
        <Input
            bind:value={type}
            class="data-field-type me-1 flex-grow-1 bg-light"
            type="select"
        >
            <option value="string" selected>String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
        </Input>
        <Button
            class="data-field-delete"
            color="danger"
            outline
            on:click={onDelete}
        >
            <Trash />
        </Button>
    </Col>
</Row>
