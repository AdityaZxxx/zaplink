import { db } from "@rinku/db";
import * as schema from "@rinku/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const isProd = process.env.NODE_ENV === "production";

/*
 * The RFC1918 ranges, so a phone on the same wifi can sign in against the dev
 * server. Patterns rather than one address: the address is DHCP-assigned, so
 * pinning it would mean editing this file every time the lease changed. Any
 * origin outside those ranges goes in TRUSTED_ORIGINS, comma separated.
 */
const localNetworkOrigins = [
	"http://localhost:*",
	"http://127.0.0.1:*",
	"http://192.168.*.*:*",
	"http://10.*.*.*:*",
	"http://172.*.*.*:*",
	...(process.env.TRUSTED_ORIGINS?.split(",") ?? [])
		.map((origin) => origin.trim())
		.filter(Boolean),
];

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.NEXT_PUBLIC_URL || "", ...localNetworkOrigins],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			/*
			 * SameSite=None forces Secure, and a browser drops a Secure cookie sent
			 * over plain http on any origin that is not localhost. Left at none in
			 * development, a phone signing in over the LAN would authenticate, get
			 * no cookie back, and be unauthenticated on every request after.
			 */
			sameSite: isProd ? "none" : "lax",
			secure: isProd,
			httpOnly: true,
		},
	},
});
