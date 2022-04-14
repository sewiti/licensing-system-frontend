export const urlBase64 = (stdbase64: string): string =>
    stdbase64?.replace(/\//g, "_").replace(/\+/g, "-");

export const getLang = () =>
    navigator.languages?.length > 0
        ? navigator.languages[0]
        : navigator.language || "en";
