import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@zaplink/api/routers/index";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * The row shapes the UI works with, taken from the router's own output rather
 * than from `profiles.$inferSelect` and friends.
 *
 * The database types declare timestamp columns as `Date`, but nothing reaches
 * the browser as a `Date`: the tRPC client decodes JSON, so those columns
 * arrive as strings. A server-side caller, by contrast, hands back real `Date`
 * objects. Typing against the router output describes the data that is
 * actually in memory on the client, which is where these types are used. A
 * server component that fetches directly casts once at its own boundary.
 *
 * This lives outside any feature because more than one feature renders these
 * rows: the dashboard pages, the settings sections and the public profile.
 */
export type ProfileData = NonNullable<RouterOutputs["profile"]["getProfile"]>;
export type LinksData = RouterOutputs["links"]["getAllLinks"];

/** One link with the relations `links.getAllLinks` loads alongside it. */
export type ProfileLink = LinksData[number];

/** The stats the dashboard summary shows. */
export type DashboardStats = NonNullable<
	RouterOutputs["analytics"]["getStats"]
>;

/**
 * What `iconForLink` needs in order to choose a glyph.
 *
 * Narrower than a link row on purpose: the helper reads only the type and the
 * two relations, and a caller should not have to hand it a whole row. That also
 * keeps it independent of the timestamp columns, so every caller fits.
 */
export type LinkKind = {
	type: string;
	platform?: { name?: string | null } | null;
	contact?: { type?: string | null } | null;
};
