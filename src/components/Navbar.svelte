<script lang="ts">
    import {
        Collapse,
        Navbar,
        NavbarToggler,
        Nav,
        NavItem,
        Dropdown,
        DropdownToggle,
        DropdownMenu,
    } from "sveltestrap";
    import { Link } from "svelte-navigator";
    import { isPrivileged, issuerID, loggedIn } from "../util/auth";
    import { brand } from "../util/const";

    let isOpen = false;

    const toggle = () => {
        isOpen = !isOpen;
    };
</script>

<Navbar light color="light" expand="sm" class="border-bottom">
    <Link class="navbar-brand" to={$loggedIn ? "/" : "/login"}>
        {brand}
    </Link>
    <NavbarToggler on:click={toggle} />
    <Collapse {isOpen} navbar expand="sm">
        <Nav class="me-auto" navbar>
            {#if $loggedIn}
                <NavItem>
                    <Link to={`/license-issuers/${$issuerID}`} class="nav-link">
                        My licenses
                    </Link>
                </NavItem>
                {#if $isPrivileged}
                    <NavItem>
                        <Link to="/license-issuers" class="nav-link">
                            License issuers
                        </Link>
                    </NavItem>
                {/if}
            {/if}
        </Nav>
        <Nav navbar>
            {#if $loggedIn}
                <Dropdown nav inNavbar>
                    <DropdownToggle nav caret>Account</DropdownToggle>
                    <DropdownMenu end>
                        <Link to="/logout" class="dropdown-item">Logout</Link>
                    </DropdownMenu>
                </Dropdown>
            {:else}
                <NavItem>
                    <Link to="/login" class="nav-link">Login</Link>
                </NavItem>
            {/if}
        </Nav>
    </Collapse>
</Navbar>
