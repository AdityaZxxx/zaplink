import { redirect } from "next/navigation";
import ProfilePageClient from "@/features/dashboard/profile/components/ProfilePageClient";
import type { LinksData, ProfileData } from "@/types/api";
import { trpcServer } from "@/utils/trpc/server";

export default async function ProfilePage() {
	const api = await trpcServer();
	const [profile, links] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
	]);

	if (!profile) {
		redirect("/onboarding");
	}

	// See ../../types: a server caller hands back `Date` for timestamp columns
	// where the browser gets strings, so one cast at the boundary is the whole
	// cost of reading them on the client.
	return (
		<ProfilePageClient
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
		/>
	);
}
