import { writable } from "svelte/store";
import type { License } from "./license";
import type { LicenseIssuer } from "./licenseIssuer";
import type { LicenseSession } from "./licenseSession";
import type { Product } from "./product";

export const licenseIssuer = writable(<LicenseIssuer>{});
export const product = writable(<Product>{});
export const licenses = writable(<License[]>[]);
export const license = writable(<License>{});
export const licenseSession = writable(<LicenseSession>{});
