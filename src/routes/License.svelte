<script lang="ts">
    import { onMount } from "svelte";

    import { navigate } from "svelte-navigator";
    import { Container, Table } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import { fetchLicense } from "../util/license";
    import { fetchLicenseIssuer } from "../util/licenseIssuer";
    import {
        fetchLicenseSessions,
        LicenseSession,
    } from "../util/licenseSession";
    import { license, licenseIssuer } from "../util/state";

    export let licenseIssuerID: number;
    export let licenseID: string;

    let loading = true;
    let licenseSessions: LicenseSession[] = [];

    $: loadData(licenseIssuerID, licenseID);

    const loadData = async (licenseIssuerID: number, licenseID: string) => {
        loading = true;
        license.set(await fetchLicense(licenseIssuerID, licenseID));
        licenseSessions = await fetchLicenseSessions(
            licenseIssuerID,
            licenseID
        );
        loading = false;
    };

    const limString = (s: string, maxLen: number): string => {
        if (s.length > maxLen) {
            return `${s.substring(0, maxLen)}…`;
        }
        return s;
    };

    const onClickLicenseSession = (licenseSessionID: string) => {
        const _licenseID = licenseID.replace("/", "_").replace("+", "-");
        const _licenseSessionID = licenseSessionID
            .replace("/", "_")
            .replace("+", "-");
        navigate(
            `/license-issuers/${licenseIssuerID}/licenses/${_licenseID}/sessions/${_licenseSessionID}`
        );
    };

    onMount(async () => {
        if ($licenseIssuer.ID === undefined) {
            licenseIssuer.set(await fetchLicenseIssuer(licenseIssuerID));
        }
    });
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb active="license" />
        <div>
            <p>{$license.Note}</p>
            <span class="text-secondary">
                ID: <span class="font-monospace">{$license.ID}</span>
            </span>
            <span class="text-secondary">
                Key: <span class="font-monospace">{$license.Key}</span>
            </span>
        </div>

        <Table striped hover class="align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Identifier</th>
                    <th>Expires</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {#if licenseSessions.length === 0}
                    <tr>
                        <td colspan="5" class="text-center">
                            <span class="text-secondary fst-italic">
                                No license sessions
                            </span>
                        </td>
                    </tr>
                {:else}
                    {#each licenseSessions as ls (ls.ClientID)}
                        <tr
                            class="clickable"
                            on:click={() => onClickLicenseSession(ls.ClientID)}
                        >
                            <td class="font-monospace">
                                {ls.ClientID.substring(0, 6)}
                            </td>
                            <td>
                                {#if ls.Identifier !== ""}
                                    {limString(ls.Identifier, 32)}
                                {:else}
                                    <span class="text-secondary fst-italic">
                                        No identifier
                                    </span>
                                {/if}
                            </td>
                            <td>{ls.Expire.toLocaleString()}</td>
                            <td>{ls.Created.toLocaleString()}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </Table>
    </Loader>
</Container>
