import { authFetch } from "./auth";
import { baseUrl } from "./const";

export type Product = {
    ID: number;
    Active: boolean;
    Name: string;
    ContactEmail: string;
    Data: string;
    Created: Date;
    Updated: Date;
};

export const fetchProducts = async (
    licenseIssuerID: number
): Promise<Product[]> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/products`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return (json as any[]).map((v) => parseProduct(v));
};

export const fetchProduct = async (
    licenseIssuerID: number,
    productID: number
): Promise<Product> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/products/${productID}`
    );
    if (!res.ok) {
        return;
    }
    const json = await res.json();
    return parseProduct(json);
};

export const createProduct = async (
    licenseIssuerID: number,
    fields: {
        active?: boolean;
        name?: string;
        contactEmail?: string;
        data?: string;
    }
): Promise<{ product: Product; status: number }> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/products`,
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
            product: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        product: parseProduct(json),
        status: res.status,
    };
};

export const updateProduct = async (
    licenseIssuerID: number,
    productID: number,
    fields: {
        active?: boolean;
        name?: string;
        contactEmail?: string;
        data?: string;
    }
): Promise<{ product: Product; status: number }> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/products/${productID}`,
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
            product: null,
            status: res.status,
        };
    }
    const json = await res.json();
    return {
        product: parseProduct(json),
        status: res.status,
    };
};

export const deleteProduct = async (
    licenseIssuerID: number,
    productID: number
): Promise<boolean> => {
    const res = await authFetch(
        `${baseUrl}/api/license-issuers/${licenseIssuerID}/products/${productID}`,
        {
            method: "DELETE",
        }
    );
    return res.ok;
};

const parseProduct = (json: any): Product => {
    return {
        ID: json.id,
        Active: json.active,
        Name: json.name,
        ContactEmail: json.contactEmail,
        Data: json.data,
        Created: new Date(json.created),
        Updated: new Date(json.updated),
    };
};
