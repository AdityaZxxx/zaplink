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

	return (
		<ProfilePageClient
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
		/>
	);
}
