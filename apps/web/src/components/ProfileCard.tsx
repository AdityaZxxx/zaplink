"use client";

import type { links, profiles } from "@zaplink/db";
import { ExternalLink, Link2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/constants/BRANDS";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import { cn } from "@/lib/utils";

type Profile = typeof profiles.$inferSelect;
type Link = typeof links.$inferSelect;

interface ProfileCardProps {
	profile: Profile;
	links: Link[];
	className?: string;
	onLinkClick?: (linkId: number) => void;
}

const getPlatform = (url: string) => {
	for (const key in SUPPORT_PLATFORMS) {
		const p = SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
		if (url.startsWith(p.baseUrl)) return p;
	}
	return null;
};

export default function ProfileCard({
	profile,
	links,
	className,
	onLinkClick,
}: ProfileCardProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const onScroll = () => setScrollY(el.scrollTop);
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);

	const bannerOffset = `translateY(${scrollY * 0.4}px)`;
	const showHeader = scrollY > 180;

	return (
		<div
			className={cn(
				"relative mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[400px] flex-col overflow-hidden bg-background text-foreground md:h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:shadow-2xl md:ring-8 md:ring-zinc-900/5 dark:md:ring-zinc-800/50",
				className,
			)}
		>
			{/* Dynamic Header */}
			<div
				className={cn(
					"absolute top-0 right-0 left-0 z-40 flex h-16 items-center justify-between px-6 transition-all duration-500",
					showHeader
						? "border-border/50 border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
						: "bg-transparent",
				)}
			>
				<div
					className={cn(
						"flex items-center gap-3 transition-all duration-500",
						showHeader
							? "translate-y-0 opacity-100"
							: "-translate-y-4 opacity-0",
					)}
				>
					<div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary/20">
						<Image
							src={profile.avatarUrl || ""}
							alt={profile.displayName || "Avatar"}
							fill
							className="object-cover"
						/>
					</div>
					<span className="font-bold text-sm tracking-tight">
						{profile.displayName}
					</span>
				</div>
			</div>

			{/* Scrollable Content */}
			<div
				ref={scrollRef}
				className="relative z-20 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{/* Parallax Banner */}
				<div className="relative h-48 w-full shrink-0 overflow-hidden">
					<div
						className="absolute inset-0 h-[120%] w-full will-change-transform"
						style={{ transform: bannerOffset }}
					>
						{profile.bannerUrl ? (
							<Image
								src={profile.bannerUrl}
								alt="Banner"
								fill
								className="object-cover"
								priority
							/>
						) : (
							<div className="h-full w-full bg-linear-to-br from-primary/30 via-primary/10 to-background" />
						)}
						<div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
					</div>
				</div>

				{/* Profile Info */}
				<div className="relative px-6 pb-8">
					<div className="-mt-16 mb-6 flex flex-col items-center">
						<div className="relative h-32 w-32 rounded-full p-1.5 shadow-2xl ring-4 ring-background">
							<div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
								{profile.avatarUrl ? (
									<Image
										src={profile.avatarUrl}
										alt={profile.displayName || "Avatar"}
										fill
										className="object-cover"
										priority
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
										<User className="h-12 w-12" />
									</div>
								)}
							</div>
						</div>

						<div className="mt-4 space-y-1 text-center">
							<h1 className="font-bold text-2xl text-foreground tracking-tight">
								{profile.displayName}
							</h1>
							<p className="font-medium text-muted-foreground text-sm">
								@{profile.username}
							</p>
						</div>

						{profile.bio && (
							<p className="mt-4 max-w-[280px] text-center text-muted-foreground text-sm leading-relaxed">
								{profile.bio}
							</p>
						)}
					</div>

					{/* Links List */}
					<div className="space-y-3 pb-24">
						{links.length > 0 ? (
							links.map((link) => {
								const p = getPlatform(link.url);
								const Icon = p?.icon || Link2;
								return (
									<a
										key={link.id}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										onClick={() => onLinkClick?.(link.id)}
										className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-1.5 pr-4 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
									>
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/50 transition-colors group-hover:border-primary/20 group-hover:text-primary">
											<Icon
												className={cn(
													"h-5 w-5 transition-colors",
													p ? "text-foreground" : "text-muted-foreground",
													"group-hover:text-primary",
												)}
											/>
										</div>

										<div className="flex min-w-0 flex-1 flex-col justify-center">
											<span className="truncate font-semibold text-foreground/90 text-sm transition-colors group-hover:text-primary">
												{p ? p.name : link.title}
											</span>
											{!p && (
												<span className="truncate text-[10px] text-muted-foreground/70">
													{link.url.replace(/^https?:\/\//, "")}
												</span>
											)}
										</div>

										<ExternalLink className="h-4 w-4 text-muted-foreground/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary/50" />
									</a>
								);
							})
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
								<div className="mb-3 rounded-full bg-muted/50 p-4">
									<Link2 className="h-6 w-6" />
								</div>
								<p className="text-sm">No links added yet</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="absolute right-0 bottom-6 left-0 flex justify-center opacity-40 transition-opacity hover:opacity-100">
					<a
						href="/"
						className="flex items-center gap-1.5 rounded-full bg-background/50 px-3 py-1.5 font-medium text-[10px] backdrop-blur-sm transition-colors hover:bg-background"
					>
						<span>Powered by</span>
						<span className="font-bold">{APP_NAME}</span>
					</a>
				</div>
			</div>
		</div>
	);
}
