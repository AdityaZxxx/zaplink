import type { auth } from "@rinku/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/*
 * No baseURL outside production, so the client falls back to
 * window.location.origin. NEXT_PUBLIC_URL is inlined at build time and says
 * localhost, which from a phone on the LAN resolves to the phone itself.
 */
export const authClient = createAuthClient({
	...(process.env.NODE_ENV === "production"
		? { baseURL: process.env.NEXT_PUBLIC_URL }
		: {}),
	plugins: [inferAdditionalFields<typeof auth>()],
});
