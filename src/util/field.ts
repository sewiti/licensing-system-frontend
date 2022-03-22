import { get, Writable, writable } from "svelte/store";
import { AnySchema, ValidationError } from "yup";

export type Field<T> = {
    value: T;
    valid: boolean;
    invalid: boolean;
    errors: string[];
};

export type WritableField<T> = Writable<Field<T>> & {
    validate: () => void;
    reset: (value?: T) => void;
};

export const newField = <T>(value: T, schema?: AnySchema): WritableField<T> => {
    const { subscribe, set, update } = writable(<Field<T>>{
        value: value,
        valid: false,
        invalid: false,
        errors: [],
    });
    const validate = () => {
        update((f) => {
            try {
                schema?.validateSync(f.value, { abortEarly: false });
                f.valid = true;
                f.errors = [];
            } catch (e) {
                f.valid = false;
                if (e instanceof ValidationError) {
                    f.errors = e.errors;
                    return f;
                }
                console.error(e);
            } finally {
                f.invalid = !f.valid;
            }
            return f;
        });
    };
    const reset = (value?: T) => {
        set({
            value: value,
            valid: false,
            invalid: false,
            errors: [],
        });
    };
    return {
        subscribe,
        set,
        update,
        validate,
        reset,
    };
};

export const validate = <T extends { [name: string]: WritableField<any> }>(
    fields: T
): {
    values: {
        [Property in keyof T]: any;
    };
    ok: boolean;
} => {
    const { values, ok } = Object.entries(fields).reduce(
        (prev, [k, v]) => {
            v.validate();
            const w = get(v);
            prev.values[k] = w.value;
            prev.ok = prev.ok && w.valid;
            return prev;
        },
        { values: {}, ok: <boolean>true }
    );
    return { values: values as { [Property in keyof T]: any }, ok };
};
