<script lang="ts">
    import { Badge, Col } from "sveltestrap";
    import { link } from "svelte-navigator";
    import type { LicenseIssuer } from "../util/licenseIssuer";
    import ChevronRight from "svelte-bootstrap-icons/lib/ChevronRight";
    import PersonFill from "svelte-bootstrap-icons/lib/PersonFill";

    export let li: LicenseIssuer = null;
    export let empty: boolean = false;
    export let placeholder: boolean = false;
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
            <span class="text-secondary fst-italic">No issuers</span>
        </Col>
    {:else}
        <Col xs="7" sm="8" class="d-flex align-items-center overflow-auto">
            <PersonFill
                class={li.Active ? "" : "text-secondary"}
                style={"min-height:1.4em;min-width:1.4em;" +
                    (li.Active ? "color:rgb(58 77 135);" : "")}
            />
            <span class="mx-2">
                {li.Username}
            </span>
            {#if li.ID === 0}
                <Badge color="danger">Admin</Badge>
            {/if}
            {#if !li.Active}
                <Badge color="secondary">Inactive</Badge>
            {/if}
        </Col>
        <Col xs="5" sm="4" class="d-flex align-items-center">
            {#if li.MaxLicenses > 0}
                <span class="flex-grow-1 overflow-hidden">
                    {li.MaxLicenses}
                </span>
            {:else}
                <span
                    class="flex-grow-1 d-flex align-items-center overflow-hidden"
                >
                    <Badge color="success">Unlimited</Badge>
                </span>
            {/if}
            <a
                href={`/license-issuers/${li.ID}`}
                class="stretched-link"
                use:link
            >
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
