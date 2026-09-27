import { User } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import { cache } from "react";
import PublicProfileClient from "@/features/profile/components/PublicProfileClient";
import { APP_NAME, DOMAIN_NAME } from "@/lib/constants/BRANDS";
import type { LinksData, ProfileData } from "@/types/api";
import { trpcServer } from "@/utils/trpc/server";

type PublicProfilePageProps = {
	params: Promise<{ username: string }>;
};

type Trpc = Awaited<ReturnType<typeof trpcServer>>;

/*
 * cache() so generateMetadata and the page share one fetch.
 */
const getProfileByUsername = cache((api: Trpc, username: string) =>
	api.profile.getProfileByUsername({ username }),
);

const getPublicLinks = cache((api: Trpc, username: string) =>
	api.links.getPublicLinks({ username }),
);

export async function generateMetadata({
	params,
}: PublicProfilePageProps): Promise<Metadata> {
	const { username } = await params;
	const api = await trpcServer();
	const profile = await getProfileByUsername(api, username);

	// A notFound() page must not be indexable as somebody else's profile.
	if (!profile) {
		return { title: `${APP_NAME}: profile not found` };
	}

	/*
	 * The SEO settings preview reads these same fallbacks, so change both.
	 */
	const title = profile.seoTitle || profile.displayName || profile.username;
	const description =
		profile.seoDescription ||
		profile.bio ||
		`${profile.displayName || profile.username} on ${APP_NAME}`;
	const url = `https://${DOMAIN_NAME}/${profile.username}`;

	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "profile",
			title,
			description,
			url,
			siteName: APP_NAME,
			...(profile.avatarUrl ? { images: [profile.avatarUrl] } : {}),
		},
		twitter: {
			card: "summary",
			title,
			description,
			...(profile.avatarUrl ? { images: [profile.avatarUrl] } : {}),
		},
	};
}

export default async function PublicProfilePage({
	params,
}: PublicProfilePageProps) {
	const { username } = await params;
	const api = await trpcServer();
	const [profile, userLinks] = await Promise.all([
		getProfileByUsername(api, username),
		getPublicLinks(api, username),
	]);

	if (!profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<User
						aria-hidden
						className="mx-auto mb-4 h-16 w-16 text-muted-foreground"
					/>
					<h1 className="mb-2 text-foreground text-title">Profile not found</h1>
					<p className="text-body text-muted-foreground">
						No profile lives at this address.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-none md:container md:mx-auto md:block md:px-4 md:py-6">
			<PublicProfileClient
				// A server caller gets Date where the client gets strings.
				profile={profile as unknown as ProfileData}
				links={userLinks as unknown as LinksData}
			/>
		</div>
	);
}
