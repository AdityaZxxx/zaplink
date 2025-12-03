"use client";

import { ExternalLink, Globe, MousePointerClick } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";

interface TopLink {
	id: number;
	title: string;
	url: string;
	clicks: number;
}

interface TopLinksListProps {
	links: TopLink[];
}

export function TopLinksList({ links }: TopLinksListProps) {
	const maxLinkClicks = links.length
		? Math.max(...links.map((l) => l.clicks))
		: 0;

	return (
		<Card className="flex flex-col shadow-sm lg:col-span-3">
			<CardHeader>
				<CardTitle>Top Performing Links</CardTitle>
				<CardDescription>Where your audience is going.</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<div className="space-y-6">
					{links.map((link) => {
						const percentage =
							maxLinkClicks > 0 ? (link.clicks / maxLinkClicks) * 100 : 0;

						const detectedPlatform = Object.entries(SUPPORT_PLATFORMS).find(
							([_, platform]) => link.url.includes(platform.baseUrl),
						);
						const PlatformIcon = detectedPlatform?.[1]?.icon;

						return (
							<div key={link.id} className="group relative">
								<div className="relative z-10 mb-2 flex items-center justify-between">
									<div className="flex max-w-[70%] items-center gap-2">
										<div className="rounded-md bg-primary/10 p-2">
											{PlatformIcon ? (
												<PlatformIcon className="h-4 w-4 text-foreground" />
											) : (
												<Globe className="h-4 w-4 text-foreground" />
											)}
										</div>
										<div className="flex min-w-0 flex-col">
											<span className="truncate font-medium text-sm transition-colors group-hover:text-primary">
												{link.title}
											</span>
											<a
												href={link.url}
												target="_blank"
												rel="noreferrer"
												className="flex items-center gap-1 truncate text-[10px] text-muted-foreground hover:underline"
											>
												{link.url} <ExternalLink className="h-2 w-2" />
											</a>
										</div>
									</div>
									<div className="text-right">
										<span className="block font-bold text-sm">
											{link.clicks}
										</span>
										<span className="text-[10px] text-muted-foreground">
											clicks
										</span>
									</div>
								</div>

								<div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
									<div
										className="h-full rounded-full bg-purple-500 transition-all duration-1000 ease-out"
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}

					{links.length === 0 && (
						<div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted/50 border-dashed p-8 text-center">
							<MousePointerClick className="mb-2 h-8 w-8 text-muted-foreground/30" />
							<p className="text-muted-foreground text-sm">
								No clicks recorded yet.
							</p>
							<p className="mt-1 text-muted-foreground/50 text-xs">
								Share your link to start tracking.
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
