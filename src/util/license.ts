import { authFetch } from "./auth";
import { baseUrl } from "./const";

export type License = {
    ID: string;
    Key: string;
    Note: string;
    Data: string;
    MaxSessions: number;
    ValidUntil: Date | null;
    Created: Date;
    Updated: Date;
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
    const _licenseID = licenseID.replace("/", "_").replace("+", "-");
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return parseLicense(json);
};

const parseLicense = (json: any): License => {
    return {
        ID: json.id,
        Key: json.key,
        Note: json.note,
        Data: json.data,
        MaxSessions: json.maxSessions,
        ValidUntil: json.validUntil ? new Date(json.validUntil) : null,
        Created: new Date(json.created),
        Updated: new Date(json.updated),
    };
};
