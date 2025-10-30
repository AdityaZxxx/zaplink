import { redirect } from "next/navigation";
import { trpcServer } from "../../../../utils/trpc/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
	const api = await trpcServer();
	const profile = await api.profile.getProfile();

	if (!profile) {
		redirect("/onboarding/create-username");
	}

	return (
		<main className="container mx-auto max-w-5xl px-4 py-8">
			<h1 className="mb-8 font-bold text-3xl">Profile</h1>
			<ProfileForm profile={profile} />
		</main>
	);
}
