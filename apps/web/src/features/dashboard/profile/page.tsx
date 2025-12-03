import { redirect } from "next/navigation";
import { trpcServer } from "@/utils/trpc/server";
import ProfilePageClient from "./components/ProfilePageClient";

export default async function ProfilePage() {
	const api = await trpcServer();
	const profile = await api.profile.getProfile();
	const links = await api.links.getAllLinks();

	if (!profile) {
		redirect("/onboarding");
	}

	return <ProfilePageClient initialProfile={profile} initialLinks={links} />;
}
