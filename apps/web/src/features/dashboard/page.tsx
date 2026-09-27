"use client";

import {
	ArrowSquareOut,
	Check,
	Copy,
	Link as LinkIcon,
	PencilSimple,
	Plus,
	ShareNetwork,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KPICard } from "@/features/dashboard/analytics/components/KPICard";
import { formatCompact } from "@/features/dashboard/analytics/lib/format";
import { iconForLink } from "@/features/dashboard/links/lib/linkIcon";
import {
	PROFILE_CARD_PREVIEW_CLASS,
	ProfileCard,
} from "@/features/profile/components";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import type { DashboardStats, LinksData, ProfileData } from "@/types/api";
import { trpc } from "@/utils/trpc/client";
import PageWithPreview from "./components/PageWithPreview";

interface DashboardPageProps {
	initialProfile: ProfileData;
	initialLinks: LinksData;
	initialStats: DashboardStats;
}

export default function DashboardPage({
	initialProfile,
	initialLinks,
	initialStats,
}: DashboardPageProps) {
	const { data: fetchedProfile } = useQuery({
		...trpc.profile.getProfile.queryOptions(),
		initialData: initialProfile,
	});

	// Null only if the profile is deleted mid-session, where the last row
	// this page already rendered beats no row at all.
	const profile = fetchedProfile ?? initialProfile;
	const { data: links = initialLinks } = useQuery({
		...trpc.links.getAllLinks.queryOptions(),
		initialData: initialLinks,
	});
	const { data: stats } = useQuery({
		...trpc.analytics.getStats.queryOptions({ range: "last7" }),
		initialData: initialStats,
	});

	const [copied, setCopied] = useState(false);

	const profileUrl = `${DOMAIN_NAME}/${profile.username}`;
	// Typed routes cannot see an interpolated path, so this needs a cast.
	const profilePath = `/${profile.username}` as Route<string>;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/${profile.username}`,
			);
			setCopied(true);
			// No toast: the reverting tick already says it worked.
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy the link");
		}
	}

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					profile={profile}
					links={links}
					className={PROFILE_CARD_PREVIEW_CLASS}
				/>
			}
		>
			{/*
			 * pb-20 at every width, since the preview button is hidden at lg but
			 * still overlaps the content below it.
			 */}
			<div className="space-y-6 pb-20 lg:space-y-8 lg:pb-0">
				<div className="space-y-1">
					<h1 className="text-title">
						Welcome back, {profile.displayName ?? profile.username}
					</h1>
					<p className="text-muted-foreground">
						How your profile did over the last 7 days.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
					<KPICard
						title="Total links"
						value={links.length}
						subtitle="on your page"
						icon={<LinkIcon />}
					/>
					<KPICard
						title="Views"
						value={formatCompact(stats.totalViews)}
						subtitle="last 7 days"
						icon={<ShareNetwork />}
						change={stats.viewsChange}
					/>
					<KPICard
						className="col-span-2 md:col-span-1"
						title="Clicks"
						value={formatCompact(stats.totalClicks)}
						subtitle="last 7 days"
						icon={<ArrowSquareOut />}
						change={stats.clicksChange}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<QuickAction
						href="/dashboard/links"
						icon={Plus}
						title="Add a link"
						description="Anything you want people to reach"
					/>
					<QuickAction
						href="/dashboard/profile"
						icon={PencilSimple}
						title="Edit profile"
						description="Your photo, banner and bio"
					/>
				</div>

				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-heading">Your links</h2>
						<Link
							href="/dashboard/links"
							className="text-body text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
						>
							All links
						</Link>
					</div>

					{links.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center py-10 text-center">
								<span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<LinkIcon className="size-5" />
								</span>
								<h3 className="mt-4 font-semibold">No links yet</h3>
								<p className="mt-1 max-w-[38ch] text-body text-muted-foreground">
									Your profile has nothing on it yet. Add a link and it shows up
									up here and on your public page.
								</p>
								{/*
								 * buttonVariants, not Button: pointing Button at an anchor puts
								 * role="button" on it and loses the link role.
								 */}
								<Link
									href="/dashboard/links"
									className={cn(buttonVariants(), "mt-5 active:scale-[0.96]")}
								>
									<Plus className="size-4" />
									Add your first link
								</Link>
							</CardContent>
						</Card>
					) : (
						<ul className="grid gap-3">
							{links.slice(0, 3).map((link) => (
								<LinkRow key={link.id} link={link} />
							))}
						</ul>
					)}
				</section>

				<Card>
					<CardContent className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="space-y-1 text-center sm:text-left">
							<h3 className="font-semibold">Share your profile</h3>
							<p className="text-body text-muted-foreground">
								<span className="font-medium text-foreground">
									{profileUrl}
								</span>
								<br />
								Every view and click is counted on your analytics page.
							</p>
						</div>
						<div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
							<CopyButton copied={copied} onCopy={handleCopy} />
							<Link
								href={profilePath}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									buttonVariants(),
									"flex-1 active:scale-[0.96] sm:flex-none",
								)}
							>
								<ShareNetwork className="size-4" />
								View profile
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageWithPreview>
	);
}

function CopyButton({
	copied,
	onCopy,
}: {
	copied: boolean;
	onCopy: () => void;
}) {
	return (
		<Button
			type="button"
			variant="outline"
			onClick={onCopy}
			aria-label={copied ? "Link copied" : "Copy profile link"}
			className="flex-1 sm:flex-none"
		>
			<span className="relative flex size-4 items-center justify-center">
				<Copy
					aria-hidden
					className={cn(
						"absolute size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
						copied
							? "scale-[0.25] opacity-0 blur-[4px]"
							: "scale-100 opacity-100 blur-0",
					)}
				/>
				<Check
					aria-hidden
					weight="bold"
					className={cn(
						"absolute size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
						copied
							? "scale-100 opacity-100 blur-0"
							: "scale-[0.25] opacity-0 blur-[4px]",
					)}
				/>
			</span>
			{copied ? "Copied" : "Copy link"}
		</Button>
	);
}

function QuickAction({
	href,
	icon: Icon,
	title,
	description,
}: {
	href: Route<string>;
	icon: typeof Plus;
	title: string;
	description: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-ring/40 hover:shadow-md focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
		>
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors duration-150 ease-out group-hover:bg-accent">
				<Icon className="size-4" weight="bold" />
			</span>
			<span className="min-w-0 space-y-0.5">
				<span className="block font-semibold">{title}</span>
				<span className="block text-body text-muted-foreground">
					{description}
				</span>
			</span>
		</Link>
	);
}

function LinkRow({ link }: { link: LinksData[number] }) {
	const Icon = iconForLink(link);

	return (
		<li>
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-ring/40 hover:shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
			>
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-150 ease-out group-hover:text-foreground">
					<Icon className="size-4" />
				</span>
				<span className="min-w-0 flex-1">
					<span className="block truncate font-medium">{link.title}</span>
					<span className="block truncate text-body text-muted-foreground">
						{link.url}
					</span>
				</span>
				<ArrowSquareOut
					aria-hidden
					className="size-4 shrink-0 text-muted-foreground/60 transition-colors duration-150 ease-out group-hover:text-muted-foreground"
				/>
			</a>
		</li>
	);
}
