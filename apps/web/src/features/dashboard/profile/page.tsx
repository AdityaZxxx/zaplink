import { redirect } from "next/navigation";
import ProfilePageClient from "@/features/dashboard/profile/components/ProfilePageClient";
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

	return <ProfilePageClient initialProfile={profile} initialLinks={links} />;
}
