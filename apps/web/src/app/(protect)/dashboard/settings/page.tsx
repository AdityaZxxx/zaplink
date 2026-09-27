import { redirect } from "next/navigation";
import SettingsPage from "@/features/dashboard/settings/page";
import type {
	LinksData,
	ProfileData,
} from "@/features/dashboard/settings/types";
import { trpcServer } from "@/utils/trpc/server";

export default async function Page() {
	const api = await trpcServer();
	const [profile, links] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
	]);

	// A signed-in user with no profile has not finished onboarding. The client
	// used to discover this after its own fetch and render `null`, which is a
	// blank page with no way forward.
	if (!profile) {
		redirect("/onboarding");
	}

	/*
	 * These two casts are the whole cost of moving the fetch to the server, and
	 * they are cast-shaped rather than suppressed: a server caller returns `Date`
	 * for timestamp columns, while the tRPC client decodes them as strings. The
	 * page only ever reads them in the browser, where the string form is what
	 * arrives anyway. See ./types for the full note.
	 */
	return (
		<SettingsPage
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
		/>
	);
}
