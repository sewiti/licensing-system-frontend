import { navigate } from "svelte-navigator";
import { derived, get } from "svelte/store";
import { baseUrl } from "./const";
import { localStorageWritable } from "./localStorage";

type AuthData = {
    token: string;
    licenseIssuerID: number;
};

const authData = localStorageWritable<AuthData>("authData", {
    licenseIssuerID: -1,
    token: "",
});

export const loggedIn = derived(authData, (data) => data.token !== "");
export const issuerID = derived(authData, (data) => data.licenseIssuerID);
export const isPrivileged = derived(
    authData,
    (data) => data.licenseIssuerID === 0
);

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

    const json = await res.json();
    authData.set(json);
    return true;
};

export const logout = () => {
    authData.set({
        licenseIssuerID: -1,
        token: "",
    });
};

export const authFetch = async (
    input: RequestInfo,
    init?: RequestInit
): Promise<Response> => {
    const token = get(authData).token;
    const res = await fetch(input, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            ...init?.headers,
        },
    });
    switch (res.status) {
        case 401: {
            logout();
            navigate("/login");
            break;
        }
        case 403: {
            navigate("/");
            break;
        }
    }
    return res;
};
