export const formatDatetime = (dt: Date): string => {
    if (dt === null) {
        return "";
    }

    const year = dt.getFullYear();
    const mon = dt.getMonth() + 1;
    const day = dt.getDate();
    const hours = dt.getHours();
    const mins = dt.getMinutes();

    const date = `${year}-${pad(mon, 2)}-${pad(day, 2)}`;
    const time = `${pad(hours, 2)}:${pad(mins, 2)}`;
    return `${date}T${time}`;
};

const pad = (
    v: string | number,
    spaces: number,
    char: string = "0"
): string => {
    const str = v.toString();
    const n = Math.max(0, spaces - str.length);
    return char.repeat(n) + str;
};

export const addDays = (dt: Date, days: number): Date => {
    dt.setDate(dt.getDate() + days);
    return dt;
};

export const nextMidnight = (dt: Date): Date => {
    dt.setMilliseconds(0);
    dt.setSeconds(0);
    dt.setMinutes(0);
    dt.setHours(0);
    addDays(dt, 1);
    return dt;
};
