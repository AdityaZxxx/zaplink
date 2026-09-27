import { redirect } from "next/navigation";
import LinksPage from "@/features/dashboard/links/page";
import { trpcServer } from "@/utils/trpc/server";

export default async function Page() {
	const api = await trpcServer();
	const [profile, links] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
	]);

	if (!profile) {
		redirect("/onboarding");
	}

	return <LinksPage initialProfile={profile} initialLinks={links} />;
}
