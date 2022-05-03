import zxcvbn from "zxcvbn";
import { get, Readable } from "svelte/store";
import { string, number, array } from "yup";
import type { ReadableField } from "./field";
import type { RequiredStringSchema } from "yup/lib/string";
import type { AnyObject } from "yup/lib/types";
import { LicenseDataField, parseTags } from "./license";

export const usernameValidator = string()
    .required("Username is required")
    .matches(
        /^[A-Za-z0-9_-]+$/,
        "Username can only contain letters, numbers, _ or - characters"
    )
    .min(3, (v) => `Username must be at least ${v.min} characters`)
    .max(64, (v) => `Username must be at most ${v.max} characters`);

export const passwordValidator = string().required("Password is required");

export const passwordConfirmValidator = (
    passwd: ReadableField<string>
): RequiredStringSchema<string, AnyObject> => {
    return string()
        .required("Password is required")
        .test({
            test: (confirmPasswd: string): boolean => {
                return confirmPasswd === get(passwd).value;
            },
            message: "Passwords must match",
        });
};

export const newPasswordEntropyValidator = (
    username: Readable<string> | ReadableField<string>
): RequiredStringSchema<string, AnyObject> => {
    let _username: string;
    if ((username as Readable<string>) !== undefined) {
        _username = get(username as Readable<string>);
    } else {
        _username = get(username as ReadableField<string>).value;
    }

    return string()
        .required("Password is required")
        .test({
            test: (passwd: string): boolean => {
                const userInput = [
                    _username,
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

export const emailValidator = string()
    .email("Email must be a valid email address.")
    .max(128, (v) => `Email must be at most ${v.max} characters`);

export const phoneNumberValidator = string()
    .test({
        test: (phoneNumber: string): boolean => {
            const minDigits = 7;
            const maxDigits = 15;
            if (phoneNumber === "") {
                return true;
            }

            let openBracket = false;
            let digits = 0;
            for (let i = 0; i < phoneNumber.length; i++) {
                const r = phoneNumber[i];
                if (i == 0 && r == "+") {
                    continue;
                }
                if ((+r).toString() === r) {
                    // 0-9
                    digits++;
                    continue;
                }
                if (r == "(") {
                    if (openBracket) {
                        return false;
                    }
                    openBracket = true;
                    continue;
                }
                if (r == ")") {
                    if (!openBracket) {
                        return false;
                    }
                    openBracket = false;
                    continue;
                }
                if (r == " " || r == "-") {
                    continue;
                }
                return false;
            }
            if (openBracket) {
                return false;
            }
            if (digits < minDigits) {
                return false;
            }
            if (digits > maxDigits) {
                return false;
            }
            return true;
        },
        message: "Phone number is invalid",
    })
    .max(24, (v) => `Phone number must be at most ${v.max} characters`);

export const licenseNameValidator = string().max(
    64,
    (v) => `Name must be at most ${v.max} characters`
);

export const productNameValidator = string().max(
    64,
    (v) => `Name must be at most ${v.max} characters`
);

export const licenseTagsValidator = string().test({
    test: (s: string): boolean => {
        const tags = parseTags(s);
        if (tags.length > 20) {
            return false;
        }
        return tags.reduce(
            (acc: boolean, tag: string) =>
                acc && tag.length >= 1 && tag.length <= 64,
            true
        );
    },
    message: "Tags must ", // TODO
});

export const licenseNoteValidator = string().max(
    500,
    (v) => `Note must be at most ${v.max} characters`
);

export const maxSessionsValidator = number().min(
    1,
    (v) => `Max sessions must be at least ${v.min}`
);

export const validUntilValidator = string()
    .required("Expiry is required")
    .test({
        test: (s: string) => !isNaN(Date.parse(s)),
        message: "Expiry is in invalid format",
    });

export const licenseDataFieldsValidator = array().test({
    test: (v) => {
        const keys = v.map((v) => (v as LicenseDataField).field);
        const hasEmpty = keys.reduce((a, v) => (v === "" ? true : a), false);
        const hasDupes = new Set(keys).size !== keys.length;
        return !hasEmpty && !hasDupes;
    },
    message: "All field names must be unique and non-empty",
});
