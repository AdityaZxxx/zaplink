import type { AppRouter } from "@rinku/api/routers/index";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

/*
 * One shape for a row whether it arrived over HTTP or from a server caller,
 * which only holds while the read queries leave timestamps out. Outside any
 * feature because the dashboard, the settings sections and the public profile
 * all render these rows.
 */
export type ProfileData = NonNullable<RouterOutputs["profile"]["getProfile"]>;

/*
 * Drizzle types the platform, custom and contact sides of a link as always
 * present, because the relation is a `one()` over a notNull foreign key. A
 * link with no matching row really does arrive with them null, which the
 * optional chaining in the card and the link managers relies on. Do not
 * tighten those away.
 */
export type LinksData = RouterOutputs["links"]["getAllLinks"];

export type ProfileLink = LinksData[number];

export type DashboardStats = NonNullable<
	RouterOutputs["analytics"]["getStats"]
>;

/*
 * Derived from the router input so the analytics page's own preset list is
 * checked against the enum the server accepts, rather than cast to it.
 */
export type StatsRange = NonNullable<
	RouterInputs["analytics"]["getStats"]["range"]
>;

/*
 * Deliberately narrower than a row, so iconForLink depends on the three fields
 * it reads rather than on the shape of a link table.
 */
export type LinkKind = {
	type: string;
	platform?: { name?: string | null } | null;
	contact?: { type?: string | null } | null;
};
