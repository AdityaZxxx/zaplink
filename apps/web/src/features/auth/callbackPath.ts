import type { Route } from "next";

/*
 * One leading slash, not followed by another slash or a backslash. That is the
 * line between a path on this site and `//evil.com` or `/\evil.com`, which
 * browsers resolve against another origin. A scheme such as `javascript:` never
 * begins with a slash, so it fails here too.
 */
const SAME_SITE_PATH = /^\/(?![/\\])/;

export const POST_SIGN_IN_PATH = "/dashboard";

/*
 * The one producer is AuthGuard, which sends the pathname it was already on,
 * but the value is a query string, so a crafted link can put anything there.
 * An off-site or unrecognised value falls back to the dashboard rather than
 * sending a freshly signed-in user somewhere the app did not choose.
 *
 * The assertion is needed because the check is a runtime one. typedRoutes
 * cannot see through it, and its own `RouteImpl` admits `WithProtocol`, which
 * is why the unchecked value compiled in the first place.
 */
export function callbackPath(raw: string | null): Route<string> {
	return raw && SAME_SITE_PATH.test(raw)
		? (raw as Route<string>)
		: POST_SIGN_IN_PATH;
}
