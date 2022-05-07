import { authFetch } from "./auth";
import { baseUrl } from "./const";
import { urlBase64 } from "./util";

export type License = {
    ID: string;
    Key: string;
    Active: boolean;
    Name: string;
    Tags: string[];
    EndUserEmail: string;
    Note: string;
    Data: string;
    MaxSessions: number;
    ValidUntil: Date | null;
    LastUsed: Date | null;
    Created: Date;
    Updated: Date;
    ProductID: number | null;
};

export const fetchLicenses = async (
    licenseIssuerID: number
): Promise<License[]> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return (json as any[]).map((v) => parseLicense(v));
};

export const fetchLicense = async (
    licenseIssuerID: number,
    licenseID: string
): Promise<License> => {
    const _licenseID = urlBase64(licenseID);
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return parseLicense(json);
};

export const createLicense = async (
    issuerID: number,
    fields: {
        active?: boolean;
        name?: string;
        tags?: string[];
        endUserEmail?: string;
        note?: string;
        data?: string;
        maxSessions?: number;
        validUntil?: Date | null;
        productID?: number | null;
    }
): Promise<{ license: License; status: number }> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${issuerID}/licenses`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fields),
        }
    );
    if (!res.ok) {
        return {
            license: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        license: parseLicense(json),
        status: res.status,
    };
};

export const deleteLicense = async (
    licenseIssuerID: number,
    licenseID: string
): Promise<boolean> => {
    const _licenseID = urlBase64(licenseID);
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}`,
        {
            method: "DELETE",
        }
    );
    return res.ok;
};

export const updateLicense = async (
    issuerID: number,
    licenseID: string,
    fields: {
        active?: boolean;
        name?: string;
        tags?: string[];
        endUserEmail?: string;
        note?: string;
        data?: string;
        maxSessions?: number;
        validUntil?: Date | null;
        productID?: number | null;
    }
): Promise<{ license: License; status: number }> => {
    const _licenseID = urlBase64(licenseID);
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${issuerID}/licenses/${_licenseID}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fields),
        }
    );
    if (!res.ok) {
        return {
            license: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        license: parseLicense(json),
        status: res.status,
    };
};

const parseLicense = (json: any): License => {
    return {
        ID: json.id,
        Key: json.key,
        Active: json.active,
        Name: json.name,
        Tags: json.tags,
        EndUserEmail: json.endUserEmail,
        Note: json.note,
        Data: json.data,
        MaxSessions: json.maxSessions,
        ValidUntil: json.validUntil ? new Date(json.validUntil) : null,
        LastUsed: json.lastUsed ? new Date(json.lastUsed) : null,
        Created: new Date(json.created),
        Updated: new Date(json.updated),
        ProductID: json.productID,
    };
};

export const parseTags = (str: string): string[] => {
    const tags = str.split(";").map((v) => v.trim());
    if (tags.length > 0 && tags[tags.length - 1] === "") {
        return tags.slice(0, -1);
    }
    return tags;
};

export const formatTags = (tags: string[]): string => {
    return tags.join("; ");
};

export type LicenseDataField = {
    _id: number; // for use in listviews
    field: string;
    value: string | number | boolean;
};

export const parseLicenseFields = (data: string): LicenseDataField[] => {
    try {
        const str = atob(data);
        const kv = Object.entries(JSON.parse(str));
        const ls = kv.map(
            (v) =>
                <LicenseDataField>{
                    _id: Math.random(),
                    field: v[0],
                    value: v[1],
                }
        );
        return ls;
    } catch {
        return null;
    }
};

export const formatLicenseFields = (fields: LicenseDataField[]): string => {
    let obj = {};
    (fields || []).forEach((v) => {
        obj[v.field] = v.value;
    });
    const str = JSON.stringify(obj);
    return btoa(str);
};
