<script lang="ts">
    import { Router } from "svelte-navigator";
    import Navbar from "./components/Navbar.svelte";
    import RouteTransition from "./components/RouteTransition.svelte";
    import Home from "./routes/Home.svelte";
    import Login from "./routes/Login.svelte";
    import Logout from "./routes/Logout.svelte";
    import NotFound from "./routes/PageNotFound.svelte";
</script>

<Router>
    <header>
        <Navbar />
    </header>
    <main class="mt-3">
        <RouteTransition path="/">
            <Home />
        </RouteTransition>
        <RouteTransition path="/login">
            <Login />
        </RouteTransition>
        <RouteTransition path="/logout">
            <Logout />
        </RouteTransition>

        <RouteTransition path="*">
            <NotFound />
        </RouteTransition>
    </main>
</Router>
