import { redirect } from "next/navigation";
import SettingsPage from "@/features/dashboard/settings/page";
import type { LinksData, ProfileData } from "@/types/api";
import { trpcServer } from "@/utils/trpc/server";

export default async function Page() {
	const api = await trpcServer();
	const [profile, links] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
	]);

	// A signed-in user with no profile has not finished onboarding.
	if (!profile) {
		redirect("/onboarding");
	}

	return (
		<SettingsPage
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
		/>
	);
}
