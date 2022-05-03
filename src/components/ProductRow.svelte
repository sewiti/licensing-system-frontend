<script lang="ts">
    import { Badge, Col } from "sveltestrap";
    import { link } from "svelte-navigator";
    import ChevronRight from "svelte-bootstrap-icons/lib/ChevronRight";
    import Window from "svelte-bootstrap-icons/lib/Window";
    import type { Product } from "../util/product";
    import { licenseIssuer, licenses } from "../util/state";
    import { derived } from "svelte/store";

    export let p: Product = null;
    export let empty: boolean = false;
    export let placeholder: boolean = false;

    const licensesCount = derived(licenses, (l) =>
        l.reduce(
            (n, v) => n + ((v.ProductID || -1) === (p ? p.ID : -1) ? 1 : 0),
            0
        )
    );

    const href = derived(licenseIssuer, (li) => {
        if (p === null) {
            return `/license-issuers/${li.ID}/products/-1`;
        }
        return `/license-issuers/${li.ID}/products/${p.ID}`;
    });
</script>

<div
    class="row px-1 py-2 position-relative issuer-row"
    class:clickable={!placeholder && !empty}
    class:border-bottom={!placeholder}
>
    {#if placeholder}
        <Col />
    {:else if empty}
        <Col
            class="d-flex justify-content-center align-items-center overflow-auto"
        >
            <span class="text-secondary fst-italic">No products</span>
        </Col>
    {:else}
        <Col xs="8" class="d-flex align-items-center overflow-auto">
            <Window
                class={p.Active ? "" : "text-secondary"}
                style={"min-height:1.4em;min-width:1.4em;" +
                    (p.Active ? "color:rgb(58 77 135);" : "")}
            />
            {#if p.Name === ""}
                <span class="mx-2 fst-italic text-secondary text-nowrap">
                    Unnamed product
                </span>
            {:else}
                <span class="mx-2 text-nowrap">
                    {p.Name}
                </span>
            {/if}
            {#if !p.Active}
                <Badge color="secondary">Inactive</Badge>
            {/if}
        </Col>
        <Col xs="4" class="d-flex align-items-center">
            <span class="mx-2 flex-grow-1">
                {$licensesCount}
            </span>
            <a href={$href} class="stretched-link" use:link>
                <ChevronRight
                    class="text-secondary ms-1"
                    width="1.2em"
                    height="1.2em"
                />
            </a>
        </Col>
    {/if}
</div>

<style>
    .issuer-row {
        min-height: 2.8em;
    }

    .clickable {
        background-color: rgba(0, 0, 0, 0);
        transition: background-color 0.15s ease;
    }

    .clickable:hover {
        cursor: pointer;
        background-color: rgba(0, 128, 255, 0.1);
        transition: background-color 0.15s ease;
    }
</style>
