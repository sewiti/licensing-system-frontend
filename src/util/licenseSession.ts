import { authFetch } from "./auth";
import { baseUrl } from "./const";

export type LicenseSession = {
    ClientID: string;
    ServerID: string;
    Identifier: string;
    MachineID: string;
    Created: Date;
    Expire: Date;
};

export const fetchLicenseSessions = async (
    licenseIssuerID: number,
    licenseID: string
): Promise<LicenseSession[]> => {
    const _licenseID = licenseID.replace("/", "_").replace("+", "-");

    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}/sessions`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return (json as any[]).map((v) => parseLicenseSession(v));
};

export const fetchLicenseSession = async (
    licenseIssuerID: number,
    licenseID: string,
    licenseSessionID: string
): Promise<LicenseSession> => {
    const _licenseID = licenseID.replace("/", "_").replace("+", "-");
    const _licenseSessionID = licenseSessionID
        .replace("/", "_")
        .replace("+", "-");

    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}/sessions/${_licenseSessionID}`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return parseLicenseSession(json);
};

export const deleteLicenseSession = async (
    licenseIssuerID: number,
    licenseID: string,
    licenseSessionID: string
): Promise<boolean> => {
    const _licenseID = licenseID.replace("/", "_").replace("+", "-");
    const _licenseSessionID = licenseSessionID
        .replace("/", "_")
        .replace("+", "-");

    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/licenses/${_licenseID}/sessions/${_licenseSessionID}`,
        {
            method: "DELETE",
        }
    );
    return res.ok;
};

const parseLicenseSession = (json: any): LicenseSession => {
    return {
        ClientID: json.csid,
        ServerID: json.ssid,
        Identifier: json.identifier,
        MachineID: json.machineID,
        Created: new Date(json.created),
        Expire: new Date(json.expire),
    };
};
