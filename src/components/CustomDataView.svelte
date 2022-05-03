<script lang="ts">
    import type { LicenseDataField } from "../util/license";
    import { Col } from "sveltestrap";

    export let data: LicenseDataField[] = [];
</script>

{#if (data || []).length === 0}
    <span class="text-secondary fst-italic">No data</span>
{:else}
    {#each data as f (f.field)}
        <div class="row mx-0 mb-2 rounded-3 data-row">
            <Col class="font-monospace px-2 py-1">
                {f.field}
            </Col>
            <Col class="font-monospace px-2 py-1 ms-1">
                <span class:fst-italic={typeof f.value === "boolean"}>
                    {JSON.stringify(f.value)}
                </span>
            </Col>
        </div>
    {/each}
{/if}

<style>
    .data-row {
        background-color: rgba(0, 0, 0, 0.04);
        transition: background-color 0.15s ease;
    }

    .data-row:hover {
        background-color: rgba(0, 0, 0, 0.09);
        transition: background-color 0.15s ease;
    }
</style>
