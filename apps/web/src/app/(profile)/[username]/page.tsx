import { User } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import { trpcServer } from "@/utils/trpc/server";

type PublicProfilePageProps = {
	params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({
	params,
}: PublicProfilePageProps) {
	const { username } = await params;
	const api = await trpcServer();
	const [profile, userLinks] = await Promise.all([
		api.profile.getProfileByUsername({ username }),
		api.links.getPublicLinks({ username }),
	]);

	if (!profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<User className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
					<h1 className="mb-2 font-bold text-2xl text-foreground">
						User Not Found
					</h1>
					<p className="text-muted-foreground">
						The profile you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-none md:container md:mx-auto md:block md:px-4 md:py-6">
			<ProfileCard profile={profile} links={userLinks} />
		</div>
	);
}
