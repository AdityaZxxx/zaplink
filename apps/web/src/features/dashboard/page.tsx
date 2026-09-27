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
import { ProfileCard } from "@/features/profile/components";
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
	/*
	 * Seeded from the server render, so the page paints with real numbers and
	 * never shows a spinner or an empty frame. The query still owns the value
	 * afterwards, which is what keeps a link added on the links page reflected
	 * here without this page knowing about that page.
	 */
	const { data: profile } = useQuery({
		...trpc.profile.getProfile.queryOptions(),
		initialData: initialProfile,
	});
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
	// Typed routes cannot see a value interpolated into a path, and the public
	// profile really does live at /<username>.
	const profilePath = `/${profile.username}` as Route<string>;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/${profile.username}`,
			);
			setCopied(true);
			// The tick reverts on its own. A toast would fire as well, and two
			// channels reporting one copy is noise.
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy to clipboard");
		}
	}

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					profile={profile}
					links={links}
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			{/* pb-20, not md:pb-0: the preview button is hidden at lg but still
			    shown from md up, so dropping the padding at md let the last row of
			    the page sit under it. */}
			<div className="space-y-6 pb-20 lg:space-y-8 lg:pb-0">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">
						Welcome back, {profile.displayName ?? profile.username}
					</h1>
					<p className="text-muted-foreground">
						Here is what is happening with your profile.
					</p>
				</div>

				{/*
				 * The same KPICard the analytics page uses, rather than a second
				 * hand-rolled stat tile. That version had 10px captions, a
				 * decorative glow on a status that was not a status, and no
				 * delta, so the two pages disagreed about the same numbers.
				 *
				 * Two across on mobile with the third on a row of its own, which
				 * is what keeps the quick actions within reach of the fold. One
				 * per row pushed them a full screen down.
				 */}
				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
					<KPICard
						title="Total links"
						value={links.length}
						subtitle="across sections"
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
						title="Add links"
						description="Share something new"
					/>
					<QuickAction
						href="/dashboard/profile"
						icon={PencilSimple}
						title="Customize profile"
						description="Photo, banner and bio"
					/>
				</div>

				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-lg tracking-tight">Your links</h2>
						<Link
							href="/dashboard/links"
							className="text-muted-foreground text-sm transition-colors duration-150 ease-out hover:text-foreground"
						>
							View all
						</Link>
					</div>

					{links.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center py-10 text-center">
								<span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<LinkIcon className="size-5" />
								</span>
								<h3 className="mt-4 font-semibold">No links yet</h3>
								<p className="mt-1 max-w-[38ch] text-muted-foreground text-sm">
									Your profile is empty. Add your first link and it will show up
									here and on your public page.
								</p>
								{/*
								 * The empty-state call to action, as a link that wears the
								 * button recipe rather than a Link re-typing it. It had
								 * lost the focus ring in the process, so a keyboard
								 * visitor tabbed onto a control that gave no sign of
								 * where they were.
								 *
								 * buttonVariants and not Button: this navigates, and Button
								 * renders a real <button>. Pointed at a <Link> it makes
								 * Base UI put role="button" on the anchor, which throws
								 * away the link role and with it middle-click, "open in
								 * new tab", and the way a screen reader announces the
								 * control. The variants are the styling half of the
								 * primitive and carry no semantics, so a caller can take
								 * them without the semantics.
								 *
								 * The press scale is spelled out rather than inherited:
								 * Button adds it as `active:not-disabled:`, and
								 * :not-disabled never matches an anchor.
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

				{/*
				 * One frame. This used to be a bordered box with 4px of padding
				 * wrapped around a second, differently-rounded, differently-
				 * coloured box, so the two radii fought each other for no reason.
				 */}
				<Card>
					<CardContent className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="space-y-1 text-center sm:text-left">
							<h3 className="font-semibold">Share your profile</h3>
							<p className="text-muted-foreground text-sm">
								<span className="font-medium text-foreground">
									{profileUrl}
								</span>
								<br />
								Every view and click is tracked on your analytics page.
							</p>
						</div>
						<div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
							<CopyButton copied={copied} onCopy={handleCopy} />
							{/*
							 * An anchor, not a button calling window.open. The link is
							 * real, so middle-click, copy-link and "open in new tab" all
							 * work, and rel="noopener" is set where it belongs rather
							 * than being left to the caller.
							 *
							 * It wears the button recipe rather than re-typing it, which
							 * is what brings the focus ring this was missing. See the
							 * empty-state call to action above for why that is
							 * buttonVariants and not Button.
							 */}
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
								Open
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageWithPreview>
	);
}

/**
 * The tick cross-fades over the copy glyph rather than replacing it. Both icons
 * stay mounted and one is layered over the other, so entering and exiting both
 * animate without a dependency and without the button changing size.
 */
function CopyButton({
	copied,
	onCopy,
}: {
	copied: boolean;
	onCopy: () => void;
}) {
	return (
		/*
		 * The `outline` variant, which is what this was re-typing by hand. Same
		 * border, same fill, same hover, plus the focus ring it was missing and
		 * the disabled treatment it had no way to express.
		 */
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

/**
 * A whole-card link, so the entire tile is the hit target rather than just the
 * label. The watermark icon this replaced was a rotated glyph at 10% opacity in
 * the corner, which read as a smudge rather than as decoration.
 */
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
				<span className="block text-muted-foreground text-sm">
					{description}
				</span>
			</span>
		</Link>
	);
}

/**
 * Each row opens the link in a new tab, and says so with a trailing glyph, so
 * the row is not a control that looks clickable and then does nothing. The
 * glyph is the one for that kind of link, not a generic chain for all of them.
 */
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
					<span className="block truncate text-muted-foreground text-sm">
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
