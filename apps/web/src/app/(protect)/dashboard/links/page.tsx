import { redirect } from "next/navigation";
import LinksPage from "@/features/dashboard/links/page";
import type { LinksData, ProfileData } from "@/types/api";
import { trpcServer } from "@/utils/trpc/server";

export default async function Page() {
	const api = await trpcServer();
	const [profile, links] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
	]);

	// The client used to discover a missing profile in an effect and push to
	// onboarding, which rendered a frame of the links page first and left the
	// back button pointing at it.
	if (!profile) {
		redirect("/onboarding");
	}

	// See @/types/api: one cast at the server boundary is the whole cost of
	// reading rows on the client, where their timestamps arrive as strings.
	return (
		<LinksPage
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
		/>
	);
}
