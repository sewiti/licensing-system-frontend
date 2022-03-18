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
    import { loggedIn } from "../util/auth";
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
        <Nav class="ms-auto" navbar>
            {#if $loggedIn}
                <Dropdown nav inNavbar>
                    <DropdownToggle nav caret>Account</DropdownToggle>
                    <DropdownMenu end>
                        <Link to="/logout" class="dropdown-item">Logout</Link>
                        <!-- <DropdownItem>Option 2</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem>Reset</DropdownItem> -->
                    </DropdownMenu>
                </Dropdown>
            {:else}
                <NavItem>
                    <Link to="/login" class="nav-link">Login</Link>
                </NavItem>
            {/if}
            <!-- <NavItem>
                <NavLink href="https://github.com/bestguy/sveltestrap"
                    >GitHub</NavLink
                >
            </NavItem>
            <Dropdown nav inNavbar>
                <DropdownToggle nav caret>Options</DropdownToggle>
                <DropdownMenu end>
                    <DropdownItem>Option 1</DropdownItem>
                    <DropdownItem>Option 2</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>Reset</DropdownItem>
                </DropdownMenu>
            </Dropdown> -->
        </Nav>
    </Collapse>
</Navbar>
