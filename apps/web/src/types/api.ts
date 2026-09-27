import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@zaplink/api/routers/index";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

/*
 * One shape for a row whether it arrived over HTTP or from a server caller,
 * which only holds while the read queries leave timestamps out. Outside any
 * feature because the dashboard, the settings sections and the public profile
 * all render these rows.
 */
export type ProfileData = NonNullable<RouterOutputs["profile"]["getProfile"]>;
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
