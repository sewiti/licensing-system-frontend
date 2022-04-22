<script lang="ts">
    import { Breadcrumb, BreadcrumbItem } from "sveltestrap";
    import { Link } from "svelte-navigator";
    import { isPrivileged } from "../util/auth";
    import { license, licenseIssuer, product } from "../util/state";
    import { derived } from "svelte/store";
    import { urlBase64 } from "../util/util";

    export let active: "" | "license-issuer" | "product" | "license" = "";

    const _licenseID = derived(license, (l) => urlBase64(l.ID));

    const level = ((): number => {
        switch (active) {
            case "":
                return 0;
            case "license-issuer":
                return 1;
            case "product":
                return 2;
            case "license":
                return 3;
            default:
                return -1;
        }
    })();
</script>

<Breadcrumb style="--bs-breadcrumb-divider: '>';">
    {#if level >= 0 && $isPrivileged}
        <BreadcrumbItem active={level === 0}>
            <Link
                to="/license-issuers"
                class={level === 0 ? "text-secondary" : ""}
            >
                License issuers
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 1}
        <BreadcrumbItem active={level === 1}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}`}
                class={level === 1 ? "text-secondary" : ""}
            >
                {$licenseIssuer.Username}
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 2}
        <BreadcrumbItem active={level === 1}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}/products/${
                    $product ? $product.ID : "null"
                }`}
                class={level === 1 ? "text-secondary" : ""}
            >
                {#if $product?.Name !== ""}
                    {$product.Name}
                {:else}
                    <span class="fst-italic">Unnamed product</span>
                {/if}
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 3}
        <BreadcrumbItem active={level === 2}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}/products/${$product.ID}/licenses/${$_licenseID}`}
                class={level === 2 ? "text-secondary" : ""}
            >
                {#if $license.Name !== ""}
                    {$license.Name}
                {:else}
                    <span class="fst-italic">Unnamed license</span>
                {/if}
            </Link>
        </BreadcrumbItem>
    {/if}
</Breadcrumb>
<hr />
