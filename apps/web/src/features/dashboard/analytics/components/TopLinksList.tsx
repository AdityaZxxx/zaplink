"use client";

import { ArrowSquareOut, CursorClick, Globe } from "@phosphor-icons/react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import { formatCompact } from "../lib/format";

interface TopLink {
	id: number;
	title: string;
	url: string;
	clicks: number;
}

interface TopLinksListProps {
	links: TopLink[];
	loading?: boolean;
}

const hostnameOf = (url: string): string | null => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
};

/*
 * Matching on the raw URL missed every link saved as `http://` or with a
 * `www.` host, and `url.includes(baseUrl)` also matched lookalikes such as
 * `notinstagram.com`. Keying on the normalised hostname fixes both, and
 * building it once at module scope replaces an Object.entries scan per link
 * per render.
 */
const PLATFORM_BY_HOST = new Map(
	Object.values(SUPPORT_PLATFORMS)
		.map((platform) => [hostnameOf(platform.baseUrl), platform] as const)
		.filter(
			(entry): entry is readonly [string, (typeof SUPPORT_PLATFORMS)[string]] =>
				entry[0] !== null,
		),
);

export function TopLinksList({ links, loading = false }: TopLinksListProps) {
	const topClicks = links.reduce((max, link) => Math.max(max, link.clicks), 0);

	return (
		<Card className="lg:col-span-3">
			<CardHeader>
				<CardTitle>Top links</CardTitle>
				<CardDescription>Where your audience is going.</CardDescription>
				{!loading && links.length > 0 && (
					<CardAction className="self-center text-muted-foreground text-xs tabular-nums">
						{links.length} tracked
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="space-y-5">
						{[0, 1, 2, 3].map((row) => (
							<div key={row} className="space-y-2">
								<div className="flex items-center gap-3">
									<Skeleton className="size-8 rounded-lg" />
									<div className="flex-1 space-y-1.5">
										<Skeleton className="h-3.5 w-2/3" />
										<Skeleton className="h-3 w-1/3" />
									</div>
									<Skeleton className="h-4 w-8" />
								</div>
								<Skeleton className="h-1.5 w-full rounded-full" />
							</div>
						))}
					</div>
				) : links.length === 0 ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
						<CursorClick
							aria-hidden
							className="size-8 text-muted-foreground opacity-40"
						/>
						<p className="font-medium text-sm">No clicks yet</p>
						<p className="max-w-56 text-muted-foreground text-xs">
							Share your profile to start tracking which links pull people in.
						</p>
					</div>
				) : (
					<ul className="space-y-5">
						{links.map((link) => {
							const host = hostnameOf(link.url);
							const platform = host ? PLATFORM_BY_HOST.get(host) : undefined;
							const PlatformIcon = platform?.icon;
							// A zero top value would divide by zero; render an empty
							// track rather than a full bar for every link.
							const share = topClicks > 0 ? link.clicks / topClicks : 0;

							return (
								<li key={link.id} className="group">
									{/*
									 * The whole row is the target. Previously only the 10px
									 * URL line was clickable, which is well under any
									 * reasonable hit target.
									 */}
									<a
										href={link.url}
										target="_blank"
										rel="noreferrer"
										className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
									>
										<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground [&_svg]:size-4">
											{PlatformIcon ? <PlatformIcon /> : <Globe />}
										</span>

										<span className="flex min-w-0 flex-1 flex-col">
											<span className="truncate font-medium text-sm">
												{link.title}
											</span>
											<span className="flex items-center gap-1 text-muted-foreground text-xs">
												{/*
												 * The bare host, not the full URL: a truncated
												 * `https://www.instagram.com/…` reads as noise,
												 * while the host identifies the destination.
												 */}
												<span className="truncate">{host ?? link.url}</span>
												<ArrowSquareOut
													aria-hidden
													className="size-3 shrink-0"
												/>
												<span className="sr-only">(opens in a new tab)</span>
											</span>
										</span>

										<span className="shrink-0 text-right">
											<span className="block font-semibold text-sm tabular-nums">
												{formatCompact(link.clicks)}
											</span>
											<span className="text-muted-foreground text-xs">
												clicks
											</span>
										</span>
									</a>

									{/*
									 * scaleX, not width. Animating width relayouts the
									 * track on every frame; scaleX is a compositor-only
									 * transform. The rounded track clips the fill, so the
									 * square leading edge stays clean at any value.
									 */}
									<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full origin-left bg-chart-series-2 transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:bg-chart-series-1"
											style={{ transform: `scaleX(${share})` }}
										/>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
