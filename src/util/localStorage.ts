import {
    get,
    StartStopNotifier,
    Updater,
    writable,
    Writable,
} from "svelte/store";

export const localStorageWritable = <T>(
    key: string,
    value: T,
    start?: StartStopNotifier<T>
): Writable<T> => {
    const json = localStorage.getItem(key) || JSON.stringify(value);
    const store = writable<T>(JSON.parse(json), start);
    const { subscribe, set: _set } = store;
    const set = (value: T) => {
        _set(value);
        localStorage.setItem(key, JSON.stringify(value));
    };
    const update = (updater: Updater<T>) => {
        set(updater(get(store)));
    };
    return { subscribe, set, update };
};
