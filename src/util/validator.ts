import { get } from "svelte/store";
import { string, number } from "yup";
import type { RequiredStringSchema } from "yup/lib/string";
import type { AnyObject } from "yup/lib/types";
import zxcvbn from "zxcvbn";
import type { ReadableField } from "./field";

export const usernameValidator = string()
    .required("Username is required")
    .min(3, (v) => `Username must be at least ${v.min} characters`)
    .max(64, (v) => `Username must be at most ${v.max} characters`);

export const passwordValidator = string().required("Password is required");

export const newPasswordEntropyValidator = (
    username: ReadableField<string>
): RequiredStringSchema<string, AnyObject> => {
    return string()
        .required("Password is required")
        .test({
            test: (passwd: string): boolean => {
                const userInput = [
                    get(username).value,
                    "online",
                    "software",
                    "licence",
                    "license",
                    "licensing",
                    "system",
                    "session",
                    "server",
                    "DRM",
                    "digital",
                    "rights",
                    "management",
                    "admin",
                ];
                const res = zxcvbn(passwd, userInput);
                return res.score >= 3;
            },
            message: "Password is too weak",
        });
};

export const maxLicenseValidator = number().min(
    1,
    (v) => `Max licenses must be at least ${v.min}`
);
