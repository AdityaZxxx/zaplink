import { redirect } from "next/navigation";
import DashboardPage from "@/features/dashboard/page";
import type { DashboardStats, LinksData, ProfileData } from "@/types/api";
import { trpcServer } from "@/utils/trpc/server";

export default async function Page() {
	const api = await trpcServer();
	const [profile, links, stats] = await Promise.all([
		api.profile.getProfile(),
		api.links.getAllLinks(),
		api.analytics.getStats({ range: "last7" }),
	]);

	// A signed-in user with no profile has not finished onboarding.
	if (!profile) {
		redirect("/onboarding");
	}

	return (
		<DashboardPage
			initialProfile={profile as unknown as ProfileData}
			initialLinks={links as unknown as LinksData}
			initialStats={stats as DashboardStats}
		/>
	);
}
