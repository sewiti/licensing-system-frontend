import { string } from "yup";

export const usernameValidator = string()
    .required("Username is required")
    .min(3, (v) => `Username must be at least ${v.min} characters`)
    .max(64, (v) => `Username must be at most ${v.max} characters`);

export const passwordValidator = string().required("Password is required");
