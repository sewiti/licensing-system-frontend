<script lang="ts">
    import { Container } from "sveltestrap";
    import Breadcrumb from "../components/Breadcrumb.svelte";
    import Loader from "../components/Loader.svelte";
    import {
        fetchLicenseSession,
        fetchLicenseSessions,
    } from "../util/licenseSession";
    import { licenseSession } from "../util/state";

    export let licenseIssuerID: number;
    export let licenseID: string;
    export let licenseSessionID: string;

    let loading = true;

    $: loadData(licenseIssuerID, licenseID, licenseSessionID);

    const loadData = async (
        licenseIssuerID: number,
        licenseID: string,
        licenseSessionID: string
    ) => {
        loading = true;
        licenseSession.set(
            await fetchLicenseSession(
                licenseIssuerID,
                licenseID,
                licenseSessionID
            )
        );
        loading = false;
    };
</script>

<Container md>
    <h6 />
    <Loader {loading}>
        <Breadcrumb active="license-session" />
        <div>
            <h3>{$licenseSession.Identifier}</h3>
            <span class="text-secondary">ID: {$licenseSession.ClientID}</span>
        </div>
    </Loader>
</Container>
