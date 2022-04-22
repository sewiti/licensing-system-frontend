<script lang="ts">
    import { Route, Router } from "svelte-navigator";
    import RouteTransition from "./components/RouteTransition.svelte";
    import Navbar from "./components/Navbar.svelte";

    import Home from "./routes/Home.svelte";
    import NotFound from "./routes/PageNotFound.svelte";

    import Login from "./routes/Login.svelte";
    import Logout from "./routes/Logout.svelte";

    import LicenseIssuers from "./routes/LicenseIssuers.svelte";
    import LicenseIssuer from "./routes/LicenseIssuer.svelte";
    import License from "./routes/License.svelte";
    import Product from "./routes/Product.svelte";
</script>

<Router>
    <header>
        <Navbar />
    </header>

    <main class="mt-3">
        <Route path="/">
            <Home />
        </Route>
        <RouteTransition path="/login">
            <Login />
        </RouteTransition>
        <Route path="/logout">
            <Logout />
        </Route>

        <Route path="/license-issuers">
            <LicenseIssuers />
        </Route>
        <Route path="/license-issuers/:licenseIssuerID" let:params>
            <LicenseIssuer licenseIssuerID={+params.licenseIssuerID} />
        </Route>
        <Route
            path="/license-issuers/:licenseIssuerID/products/:productID"
            let:params
        >
            <Product
                licenseIssuerID={+params.licenseIssuerID}
                productID={+params.productID}
            />
        </Route>
        <Route
            path="/license-issuers/:licenseIssuerID/products/:productID/licenses/:licenseID"
            let:params
        >
            <License
                licenseIssuerID={+params.licenseIssuerID}
                licenseID={params.licenseID}
            />
        </Route>

        <Route path="*">
            <NotFound />
        </Route>
    </main>
</Router>
