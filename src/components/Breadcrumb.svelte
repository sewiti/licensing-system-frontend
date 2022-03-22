<script lang="ts">
    import { Breadcrumb, BreadcrumbItem } from "sveltestrap";
    import { Link } from "svelte-navigator";
    import { isPrivileged } from "../util/auth";
    import { license, licenseIssuer, licenseSession } from "../util/state";
    import { derived } from "svelte/store";
    import Loader from "./Loader.svelte";

    export let active: "" | "license-issuer" | "license" | "license-session" =
        "";

    const _licenseID = derived(license, (l) => {
        return l.ID?.replace("/", "_").replace("+", "-");
    });
    const _licenseSessionID = derived(licenseSession, (ls) => {
        return ls.ClientID?.replace("/", "_").replace("+", "-");
    });

    const level = ((): number => {
        switch (active) {
            case "":
                return 0;
            case "license-issuer":
                return 1;
            case "license":
                return 2;
            case "license-session":
                return 3;
            default:
                return -1;
        }
    })();
</script>

<Breadcrumb style="--bs-breadcrumb-divider: '>';">
    {#if level >= 0 && $isPrivileged}
        <BreadcrumbItem active={level === 0}>
            <Link to="/license-issuers" class="link-secondary">
                License issuers
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 1}
        <BreadcrumbItem active={level === 1}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}`}
                class="link-secondary"
            >
                {$licenseIssuer.Username}
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 2}
        <BreadcrumbItem active={level === 2}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}/licenses/${$_licenseID}`}
                class="link-secondary font-monospace"
            >
                {$license.ID?.substring(0, 6)}
            </Link>
        </BreadcrumbItem>
    {/if}
    {#if level >= 3}
        <BreadcrumbItem active={level === 3}>
            <Link
                to={`/license-issuers/${$licenseIssuer.ID}/licenses/${$_licenseID}/sessions/${$_licenseSessionID}`}
                class="link-secondary font-monospace"
            >
                {$licenseSession.ClientID?.substring(0, 6)}
            </Link>
        </BreadcrumbItem>
    {/if}
</Breadcrumb>
