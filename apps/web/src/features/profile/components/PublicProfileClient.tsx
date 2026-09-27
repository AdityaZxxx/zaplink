"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { ProfileCard } from "@/features/profile/components";
import type { LinksData, ProfileData } from "@/types/api";
import { trpc } from "@/utils/trpc/client";

interface PublicProfileClientProps {
	/*
	 * Cast-shaped rather than suppressed. This route is a server component, so
	 * it hands back real `Date` objects for timestamp columns where the client
	 * types describe the strings a tRPC response carries. ProfileCard reads
	 * none of those columns, so the two are interchangeable here.
	 */
	profile: ProfileData;
	links: LinksData;
}

export default function PublicProfileClient({
	profile,
	links,
}: PublicProfileClientProps) {
	const trackViewMutation = useMutation(
		trpc.analytics.trackView.mutationOptions(),
	);
	const trackClickMutation = useMutation(
		trpc.analytics.trackClick.mutationOptions(),
	);

	useEffect(() => {
		if (profile.username) {
			trackViewMutation.mutate({ username: profile.username });
		}
	}, [profile.username, trackViewMutation.mutate]);

	const handleLinkClick = (linkId: number) => {
		trackClickMutation.mutate({ linkId });
	};

	return (
		<div className="mx-auto overflow-hidden md:mt-32 md:h-[700px] md:w-[340px] md:rounded-4xl">
			<ProfileCard
				profile={profile}
				links={links}
				onLinkClick={handleLinkClick}
			/>
		</div>
	);
}
