import { authFetch } from "./auth";
import { baseUrl } from "./const";

export type LicenseIssuer = {
    ID: number;
    Active: boolean;
    Username: string;
    Email: string;
    PhoneNumber: string;
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
    return parseLicenseIssuer(json);
};

export const fetchLicenseIssuers = async (): Promise<LicenseIssuer[]> => {
    const res = await authFetch(`${baseUrl}/api/license-issuers`);
    if (!res.ok) {
        return [];
    }
    const json = await res.json();
    return (json as any[]).map((v) => parseLicenseIssuer(v));
};

export const editLicenseIssuer = async (
    id: number,
    fields: {
        active?: boolean;
        username?: string;
        email?: string;
        phoneNumber?: string;
        maxLicenses?: number;
    }
): Promise<{ licenseIssuer: LicenseIssuer; status: number }> => {
    const res = await authFetch(`${baseUrl}/api/license-issuers/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
    });
    if (!res.ok) {
        return {
            licenseIssuer: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        licenseIssuer: parseLicenseIssuer(json),
        status: res.status,
    };
};

export const deleteLicenseIssuer = async (id: number): Promise<boolean> => {
    const res = await authFetch(`${baseUrl}/api/license-issuers/${id}`, {
        method: "DELETE",
    });
    return res.ok;
};

export const createLicenseIssuer = async (fields: {
    active: boolean;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    maxLicenses: number;
}): Promise<{ licenseIssuer: LicenseIssuer; status: number }> => {
    const res = await authFetch(`${baseUrl}/api/license-issuers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
    });
    if (!res.ok) {
        return {
            licenseIssuer: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        licenseIssuer: parseLicenseIssuer(json),
        status: res.status,
    };
};

const parseLicenseIssuer = (json: any): LicenseIssuer => {
    return {
        ID: json.id,
        Active: json.active,
        Username: json.username,
        Email: json.email,
        PhoneNumber: json.phoneNumber,
        MaxLicenses: json.maxLicenses,
        Created: new Date(json.created),
        Updated: new Date(json.updated),
    };
};
