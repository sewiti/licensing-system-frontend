<script lang="ts">
    import * as yup from "yup";
    import { newField, validate } from "../util/field";
    import { navigate, useFocus } from "svelte-navigator";
    import {
        Button,
        Card,
        CardBody,
        CardHeader,
        CardTitle,
        Col,
        Container,
        Form,
        FormGroup,
        Label,
        Row,
        Spinner,
    } from "sveltestrap";
    import { loggedIn, login } from "../util/auth";
    import { get, writable } from "svelte/store";
    import { onMount } from "svelte";
    import { brand } from "../util/const";
    import { passwordValidator, usernameValidator } from "../util/validator";

    const focus = useFocus();
    const errorMsg = writable("");
    let loading = false;

    const username = newField("", usernameValidator);
    const password = newField("", passwordValidator);

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            errorMsg.set("");

            const { values, ok } = validate({
                username: username,
                password: password,
            });
            if (!ok) {
                return;
            }

            const loginOK = await login(values.username, values.password);
            if (!loginOK) {
                username.update((v) => {
                    v.invalid = true;
                    return v;
                });
                password.update((v) => {
                    v.invalid = true;
                    return v;
                });
                errorMsg.set("Invalid username and/or password");
                return;
            }
            navigate("/");
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        if (get(loggedIn)) {
            navigate("/");
        }
    });
</script>

<svelte:head>
    <title>Login - {brand}</title>
</svelte:head>

<Container sm>
    <Row class="justify-content-center">
        <Col sm="10" md="8" lg="6" xxl="5">
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardBody>
                    <Form on:submit={onSubmit}>
                        <FormGroup>
                            <Label for="username">Username</Label>
                            <input
                                use:focus
                                class="form-control"
                                id="username"
                                name="username"
                                placeholder="Username"
                                type="text"
                                bind:value={$username.value}
                                on:focusout={username.validate}
                                class:is-valid={$username.valid}
                                class:is-invalid={$username.invalid}
                            />
                            {#if $username.invalid}
                                <div class="invalid-feedback">
                                    <ul>
                                        {#each $username.errors as err}
                                            <li>{err}</li>
                                        {/each}
                                    </ul>
                                </div>
                            {/if}
                        </FormGroup>

                        <FormGroup>
                            <Label for="password">Password</Label>
                            <input
                                class="form-control"
                                id="password"
                                name="password"
                                placeholder="Password"
                                type="password"
                                bind:value={$password.value}
                                on:focusout={password.validate}
                                class:is-valid={$password.valid}
                                class:is-invalid={$password.invalid}
                            />
                            {#if $password.invalid}
                                <div class="invalid-feedback">
                                    <ul>
                                        {#each $password.errors as err}
                                            <li>{err}</li>
                                        {/each}
                                    </ul>
                                </div>
                            {/if}
                        </FormGroup>

                        <Button
                            type="submit"
                            color="primary"
                            block
                            disabled={loading}
                        >
                            {#if loading}
                                <Spinner size="sm" role="status" />
                            {/if}
                            Login
                        </Button>

                        {#if $errorMsg !== ""}
                            <div
                                class="text-danger mt-1"
                                style="font-size: .875em"
                            >
                                <ul class="mb-0">
                                    <li>{$errorMsg}</li>
                                </ul>
                            </div>
                        {/if}
                    </Form>
                </CardBody>
            </Card>
        </Col>
    </Row>
</Container>
