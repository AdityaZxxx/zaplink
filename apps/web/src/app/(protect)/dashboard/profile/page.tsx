import { redirect } from "next/navigation";
import { trpcServer } from "../../../../utils/trpc/server";

export default async function ProfilePage() {
	const api = await trpcServer();
	const profile = await api.profile.getProfile();
	const _links = await api.links.getAllLinks();

	if (!profile) {
		redirect("/onboarding");
	}

	return (
		<main className="mx-auto min-h-screen w-full max-w-5xl overflow-x-hidden px-4 py-8">
			<h1 className="mb-8 font-bold text-3xl">Profile</h1>
			helo
			{/* <ProfileForm profile={profile} links={links} /> */}
		</main>
	);
}
