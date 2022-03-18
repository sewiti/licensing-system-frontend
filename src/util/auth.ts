import { derived, writable } from "svelte/store";
import { baseUrl } from "./const";

const token = writable(localStorage.getItem("token") || "");
token.subscribe((token) => {
    localStorage.setItem("token", token);
});

export const loggedIn = derived(token, ($token) => {
    return $token !== "";
});

export const login = async (
    username: string,
    password: string
): Promise<boolean> => {
    const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    if (!res.ok) {
        return false;
    }

    const body = await res.json();
    token.set(body.token);
    return true;
};

export const logout = () => {
    token.set("");
};
