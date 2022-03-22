import { authFetch } from "./auth";
import { baseUrl } from "./const";

export type LicenseIssuer = {
    ID: number;
    Active: boolean;
    Username: string;
    MaxLicenses: number;
    Created: Date;
    Updated: Date;
};

export const fetchLicenseIssuer = async (
    licenseIssuerID: number
): Promise<LicenseIssuer> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}`
    );
    if (!res.ok) {
        return <LicenseIssuer>{};
    }
    const json = await res.json();
    return parseLicesnseIssuer(json);
};

export const fetchLicenseIssuers = async (): Promise<LicenseIssuer[]> => {
    const res = await authFetch(`${baseUrl}/api/license-issuers`);
    if (!res.ok) {
        return [];
    }
    const json = await res.json();
    return (json as any[]).map((v) => parseLicesnseIssuer(v));
};

const parseLicesnseIssuer = (json: any): LicenseIssuer => {
    return {
        ID: json.id,
        Active: json.active,
        Username: json.username,
        MaxLicenses: json.maxLicenses,
        Created: new Date(json.created),
        Updated: new Date(json.updated),
    };
};
