<script lang="ts">
    import { Badge, Col, Tooltip } from "sveltestrap";
    import { link } from "svelte-navigator";
    import type { License } from "../util/license";
    import { licenseIssuer, product } from "../util/state";
    import { getLang, urlBase64 } from "../util/util";
    import ChevronRight from "svelte-bootstrap-icons/lib/ChevronRight";
    import PostcardFill from "svelte-bootstrap-icons/lib/PostcardFill";
    import { createEventDispatcher } from "svelte";

    export let index: number = 0;
    export let l: License = null;
    export let empty: boolean = false;
    export let placeholder: boolean = false;

    let href: string;
    $: {
        const _licenseID = urlBase64(l?.ID);
        href = `/license-issuers/${$licenseIssuer.ID}/products/${$product.ID}/licenses/${_licenseID}`;
    }

    const dispatch = createEventDispatcher();

    let licenseValid: boolean = true;
    $: licenseValid = l?.ValidUntil === null || l?.ValidUntil >= new Date();

    const onClickTag = (tag: string): ((e: Event) => void) => {
        return (e: Event) => {
            e.preventDefault();
            dispatch("clickTag", { tag });
        };
    };
</script>

<div
    class="row px-1 py-2 position-relative license-row"
    class:clickable={!placeholder && !empty}
    class:border-bottom={!placeholder}
>
    {#if placeholder}
        <Col />
    {:else if empty}
        <Col
            class="d-flex justify-content-center align-items-center overflow-auto"
        >
            <span class="text-secondary fst-italic">No licenses</span>
        </Col>
    {:else}
        <Col xs="5" class="d-flex align-items-center overflow-auto">
            <PostcardFill
                class={l.Active ? "" : "text-secondary"}
                style={"min-height:1.4em;min-width:1.4em;" +
                    (l.Active ? "color:rgb(58 77 135);" : "")}
            />
            <span
                class="mx-2 text-nowrap"
                class:text-secondary={l.Name === ""}
                class:fst-italic={l.Name === ""}
            >
                {l.Name !== "" ? l.Name : "Unnamed license"}
            </span>
            {#if !l.Active}
                <Badge color="secondary">Inactive</Badge>
            {/if}
            {#each l.Tags as tag}
                <a href="/#" style="z-index:2;" on:click={onClickTag(tag)}>
                    <span class="badge rounded-pill bg-primary me-1 tag">
                        {tag}
                    </span>
                </a>
            {/each}
        </Col>
        <Col xs="4" class="d-flex align-items-center overflow-auto">
            {#if l.ValidUntil !== null}
                <a
                    {href}
                    id={`valid-until-${index}`}
                    class="text-dark text-decoration-none text-nowrap"
                    style="z-index:2;"
                >
                    {l.ValidUntil.toLocaleDateString(getLang())}
                </a>
                <Tooltip target={`valid-until-${index}`} placement="top">
                    {l.ValidUntil.toLocaleString(getLang())}
                </Tooltip>
            {:else}
                <Badge color="success">No expiry</Badge>
            {/if}
            {#if !licenseValid}
                <Badge class="ms-2" color="secondary">Expired</Badge>
            {/if}
        </Col>
        <Col xs="3" class="d-flex align-items-center">
            <div class="flex-grow-1 d-flex align-items-center overflow-hidden">
                {#if l.LastUsed !== null}
                    <a
                        {href}
                        id={`last-used-${index}`}
                        class="text-dark text-decoration-none text-nowrap "
                        style="z-index:2;"
                    >
                        {l.LastUsed.toLocaleDateString(getLang())}
                    </a>
                    <Tooltip target={`last-used-${index}`} placement="top">
                        {l.LastUsed.toLocaleString(getLang())}
                    </Tooltip>
                {:else}
                    <Badge color="secondary">Not used</Badge>
                {/if}
            </div>
            <a {href} class="stretched-link" use:link>
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
    .license-row {
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

    .tag:hover {
        text-decoration: underline !important;
    }
</style>
