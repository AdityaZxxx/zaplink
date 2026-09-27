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
 * generateMetadata and the page both need the profile, and Next runs them in
 * the same request. `cache` collapses them into one query instead of two, and
 * is scoped to the request so nothing leaks between visitors.
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

	// A missing profile renders the not-found view, which should not be
	// indexable as somebody else's page.
	if (!profile) {
		return { title: `${APP_NAME} — Page not found` };
	}

	/*
	 * The fallbacks below are the contract the SEO settings preview in the
	 * dashboard draws against. Change one and change the other: the panel shows
	 * what a search engine will show, so a blank field has to resolve the same
	 * way here as it does there.
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
			<PublicProfileClient
				// A server caller hands back `Date` for timestamp columns where
				// the client describes the strings a tRPC response carries.
				// ProfileCard reads none of those columns.
				profile={profile as unknown as ProfileData}
				links={userLinks as unknown as LinksData}
			/>
		</div>
	);
}
