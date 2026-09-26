"use client";

import { useMutation } from "@tanstack/react-query";
import type { links, profiles } from "@zaplink/db";
import { useEffect } from "react";
import { ProfileCard } from "@/features/profile/components";
import { trpc } from "@/utils/trpc/client";

type Profile = typeof profiles.$inferSelect;
type Link = typeof links.$inferSelect;

interface PublicProfileClientProps {
	profile: Profile;
	links: Link[];
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
