import { writable } from "svelte/store";
import type { License } from "./license";
import type { LicenseIssuer } from "./licenseIssuer";
import type { LicenseSession } from "./licenseSession";

export const licenseIssuer = writable(<LicenseIssuer>{});
export const license = writable(<License>{});
export const licenseSession = writable(<LicenseSession>{});
