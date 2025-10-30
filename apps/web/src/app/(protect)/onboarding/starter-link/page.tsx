import { redirect } from "next/navigation";
import { trpcServer } from "../../../../utils/trpc/server";
import { StarterLinkForm } from "./StarterLinkForm";

export default async function StarterLinkPage() {
	const api = await trpcServer();
	const profile = await api.profile.getProfile();
	const links = await api.links.getAllLinks();

	if (links.length > 0) return redirect("/dashboard");
	if (!profile) return redirect("/onboarding/create-username");

	return (
		<main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto mb-36 w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="font-bold text-3xl">
						Welcome, {profile.displayName}!
					</h1>
					<p className="text-muted-foreground">
						Let's add your first link to get started.
					</p>
				</div>
				<StarterLinkForm />
			</div>
		</main>
	);
}
