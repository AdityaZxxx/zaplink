import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@zaplink/api/routers/index";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/*
 * Typed from the router output, not the row types: the tRPC client decodes
 * timestamps to strings, while a server caller gets real Dates, so a server
 * component casts once at its own boundary. Outside any feature because the
 * dashboard, the settings sections and the public profile all render these rows.
 */
export type ProfileData = NonNullable<RouterOutputs["profile"]["getProfile"]>;
export type LinksData = RouterOutputs["links"]["getAllLinks"];

export type ProfileLink = LinksData[number];

export type DashboardStats = NonNullable<
	RouterOutputs["analytics"]["getStats"]
>;

/*
 * Deliberately narrower than a row, so iconForLink needs no timestamp columns.
 */
export type LinkKind = {
	type: string;
	platform?: { name?: string | null } | null;
	contact?: { type?: string | null } | null;
};
