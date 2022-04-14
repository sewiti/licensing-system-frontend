<script lang="ts">
    import { Col, Tooltip } from "sveltestrap";
    import type { LicenseSession } from "../util/licenseSession";
    import BoxArrowUpRight from "svelte-bootstrap-icons/lib/BoxArrowUpRight";
    import Link45Deg from "svelte-bootstrap-icons/lib/Link45Deg";
    import { getLang } from "../util/util";
    import { createEventDispatcher } from "svelte";

    export let index: number = 0;
    export let ls: LicenseSession = null;
    export let empty: boolean = false;
    export let placeholder: boolean = false;

    const dispatch = createEventDispatcher();

    const onClick = (e: Event) => {
        e?.preventDefault();
        dispatch("click", { id: ls.ClientID });
    };
</script>

<div
    class="row px-1 py-2 position-relative license-session-row"
    class:clickable={!placeholder && !empty}
    class:border-bottom={!placeholder}
>
    {#if placeholder}
        <Col />
    {:else if empty}
        <Col
            class="d-flex justify-content-center align-items-center overflow-auto"
        >
            <span class="text-secondary fst-italic">No license sessions</span>
        </Col>
    {:else}
        <Col xs="5" sm="6" class="d-flex align-items-center overflow-auto">
            <Link45Deg
                style="min-height:1.4em;min-width:1.4em;color:rgb(58 77 135);"
            />
            <span
                class="mx-2 text-nowrap"
                class:text-secondary={ls.Identifier === ""}
                class:fst-italic={ls.Identifier === ""}
            >
                {ls.Identifier !== "" ? ls.Identifier : "No identifier"}
            </span>
        </Col>
        <Col xs="3" sm="3" class="d-flex align-items-center overflow-auto">
            {#if ls.AppVersion !== ""}
                <span>
                    {ls.AppVersion}
                </span>
            {:else}
                <span class="text-secondary fst-italic">Unspecified</span>
            {/if}
        </Col>
        <Col xs="4" sm="3" class="d-flex align-items-center">
            <div class="flex-grow-1 d-flex align-items-center">
                <a
                    href="/#"
                    id={`expires-${index}`}
                    class="text-dark text-decoration-none text-nowrap"
                    style="z-index:2;"
                    on:click={onClick}
                >
                    {ls.Expire.toLocaleDateString(getLang())}
                </a>
                <Tooltip target={`expires-${index}`} placement="top">
                    {ls.Expire.toLocaleString(getLang())}
                </Tooltip>
            </div>
            <a href="/#" class="stretched-link" on:click={onClick}>
                <BoxArrowUpRight
                    class="text-secondary ms-1 mb-1"
                    width="1.2em"
                    height="1.2em"
                />
            </a>
        </Col>
    {/if}
</div>

<style>
    .license-session-row {
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
