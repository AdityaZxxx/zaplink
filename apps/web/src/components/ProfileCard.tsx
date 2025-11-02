"use client";

import type { links, profiles } from "@zaplink/db";
import { Link2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/constants/NAMING";
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";

type Profile = typeof profiles.$inferSelect;
type Link = typeof links.$inferSelect;

interface ProfileCardProps {
	profile: Profile;
	links: Link[];
}

const getPlatform = (url: string) => {
	for (const key in SUPPORT_PLATFORMS) {
		const p = SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
		if (url.startsWith(p.baseUrl)) return p;
	}
	return null;
};

export default function ProfileCard({ profile, links }: ProfileCardProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const onScroll = () => setScrollY(el.scrollTop);
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);

	const bannerOffset = `translateY(${scrollY * 0.3}px)`;
	const bannerOpacity = Math.max(0, 1 - scrollY / 160);

	const showHeader = scrollY > 120;

	return (
		<div className="relative mx-auto flex h-[calc(100vh-4rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-background text-foreground shadow-2xl ring-1 ring-border">
			<div
				className="absolute top-0 left-0 z-0 h-64 w-full will-change-transform"
				style={{ transform: bannerOffset, opacity: bannerOpacity }}
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
					<div className="h-full w-full bg-gradient-to-br from-primary/20 via-card to-background" />
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/40 to-transparent" />
			</div>

			<div
				className={`sticky top-0 z-30 flex h-14 items-center justify-between px-5 transition-opacity duration-300 ${
					showHeader ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			>
				<div className="flex items-center gap-3">
					<Image
						src={profile.avatarUrl || ""}
						alt={profile.displayName || "Avatar"}
						width={32}
						height={32}
						className="rounded-full ring-2 ring-background/80"
					/>
					<span className="font-semibold text-sm">{profile.displayName}</span>
				</div>
			</div>

			<div
				ref={scrollRef}
				className="relative z-20 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<div className="h-64 shrink-0" />

				<div className="-mt-16 flex justify-center">
					<div className="rounded-full shadow-xl ring-4 ring-background/80">
						{profile.avatarUrl ? (
							<Image
								src={profile.avatarUrl}
								alt={profile.displayName || "Avatar"}
								width={96}
								height={96}
								className="rounded-full"
							/>
						) : (
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-transparent">
								<User className="h-10 w-10 text-primary" />
							</div>
						)}
					</div>
				</div>

				<div className="mt-4 px-6 text-center">
					<h1 className="font-extrabold text-2xl tracking-tight">
						{profile.displayName}
					</h1>
					<p className="text-muted-foreground text-sm">@{profile.username}</p>
					{profile.bio && (
						<p className="wrap-break-word mx-auto mt-2 max-w-sm text-muted-foreground text-sm leading-relaxed">
							{profile.bio}
						</p>
					)}
				</div>

				<div className="mt-6 rounded-t-3xl bg-card px-5 pt-5 pb-32 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] ring-1 ring-border">
					{links.length ? (
						<div className="space-y-3">
							{links.map((link) => {
								const p = getPlatform(link.url);
								const Icon = p?.icon || Link2;
								return (
									<a
										key={link.id}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										className="group hover:-translate-y-0.5 flex items-center gap-4 rounded-2xl border bg-background p-4 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
									>
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
											<Icon
												className={`h-6 w-6 ${
													p ? "text-primary" : "text-muted-foreground"
												}`}
											/>
										</div>

										<div className="min-w-0 flex-1">
											<div className="truncate font-semibold text-sm">
												{p ? p.name : link.title}
											</div>
											<div className="truncate text-muted-foreground text-xs">
												{link.url.replace(/^https?:\/\//, "")}
											</div>
										</div>
									</a>
								);
							})}
						</div>
					) : (
						<div className="flex h-48 flex-col items-center justify-center text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<Link2 className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="font-semibold">No links yet</h3>
							<p className="text-muted-foreground text-sm">
								This profile hasn’t added any links.
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="absolute bottom-0 left-0 z-30 w-full bg-card py-4 text-center">
				<p className="text-muted-foreground text-xs">Powered by {APP_NAME}</p>
			</div>
		</div>
	);
}
