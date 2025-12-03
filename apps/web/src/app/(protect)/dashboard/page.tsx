"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfileCard from "@/components/ProfileCard";
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import { trpc } from "@/utils/trpc/client";

export default function DashboardPage() {
	const { data: profile, isLoading } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);
	const { data: links = [] } = useQuery(trpc.links.getAllLinks.queryOptions());

	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !profile) {
			router.replace("/login");
		}
	}, [isLoading, profile, router]);

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!profile) return null;

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					// @ts-expect-error - Date vs string mismatch from API
					profile={profile}
					// @ts-expect-error - Date vs string mismatch from API
					links={links}
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			<div className="rounded-xl border border-dashed p-8 text-center">
				<h2 className="font-semibold text-xl">Dashboard Content</h2>
				<p className="text-muted-foreground">
					Stats and other widgets will go here.
				</p>
			</div>
		</PageWithPreview>
	);
}
