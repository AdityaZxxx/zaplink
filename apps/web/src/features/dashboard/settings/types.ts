import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@zaplink/api/routers/index";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * The row shapes this feature works with, taken from the router's own output
 * rather than from `profiles.$inferSelect`.
 *
 * The database types declare timestamp columns as `Date`, but nothing reaches
 * the browser as a `Date`: the tRPC client decodes JSON, so those columns
 * arrive as strings. A server-side caller, by contrast, hands back real `Date`
 * objects. Typing against the router output describes the data that is
 * actually in memory on the client, which is the only place these types are
 * used.
 */
export type ProfileData = NonNullable<RouterOutputs["profile"]["getProfile"]>;
export type LinksData = RouterOutputs["links"]["getAllLinks"];
