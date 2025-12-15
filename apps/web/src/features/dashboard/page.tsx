"use client";

import { useQuery } from "@tanstack/react-query";
import {
	BarChart3,
	Copy,
	Link as LinkIcon,
	Palette,
	Plus,
	Share2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCard } from "@/features/profile/components";
import { trpc } from "@/utils/trpc/client";
import PageWithPreview from "./components/PageWithPreview";

export default function DashboardPage() {
	const { data: profile, isLoading } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);
	const { data: links = [] } = useQuery(trpc.links.getAllLinks.queryOptions());

	const { data: stats } = useQuery(
		trpc.analytics.getStats.queryOptions({ range: "last7" }),
	);

	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !profile) {
			router.replace("/login");
		}
	}, [isLoading, profile, router]);

	const handleCopyLink = () => {
		if (profile?.username) {
			const url = `${window.location.origin}/${profile.username}`;
			navigator.clipboard.writeText(url);
			toast.success("Profile link copied to clipboard!");
		}
	};

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
			<div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
				{/* Welcome Section */}
				<div className="flex flex-col gap-1 md:gap-2">
					<h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl md:text-4xl">
						Welcome back, {profile.displayName}!
					</h1>
					<p className="text-muted-foreground text-sm md:text-base">
						Here's what's happening with your profile today.
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
					<Card className="border-border bg-card backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								Total Links
							</CardTitle>
							<LinkIcon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent className="p-4 pt-0 md:p-6 md:pt-0">
							<div className="font-bold text-2xl text-foreground md:text-3xl">
								{links.length}
							</div>
							<p className="text-[10px] text-muted-foreground md:text-xs">
								Active links
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-card backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								Total Views
							</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent className="p-4 pt-0 md:p-6 md:pt-0">
							<div className="font-bold text-2xl text-foreground md:text-3xl">
								{stats?.totalViews || 0}
							</div>
							<p className="text-[10px] text-muted-foreground md:text-xs">
								Last 7 days
							</p>
						</CardContent>
					</Card>
					<Card className="col-span-2 border-border bg-card backdrop-blur-sm md:col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								Profile Status
							</CardTitle>
							<div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
						</CardHeader>
						<CardContent className="p-4 pt-0 md:p-6 md:pt-0">
							<div className="font-bold text-foreground text-xl md:text-2xl">
								Active
							</div>
							<p className="text-[10px] text-muted-foreground md:text-xs">
								Visible to public
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-2 gap-3 md:gap-4">
					<Link href="/dashboard/links" className="group">
						<div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:p-6">
							<div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
								<Plus className="-translate-y-4 md:-translate-y-8 h-16 w-16 translate-x-4 rotate-12 transform text-primary md:h-24 md:w-24 md:translate-x-8" />
							</div>
							<div className="relative z-10 flex h-full flex-col justify-between">
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110 md:mb-4 md:h-12 md:w-12">
									<Plus className="h-5 w-5 text-primary md:h-6 md:w-6" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-base text-foreground md:text-lg">
										Add Link
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-xs md:text-sm">
										Share something new
									</p>
								</div>
							</div>
						</div>
					</Link>
					<Link href="/dashboard/profile" className="group">
						<div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:p-6">
							<div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
								<Palette className="-rotate-12 -translate-y-4 md:-translate-y-8 h-16 w-16 translate-x-4 transform text-primary md:h-24 md:w-24 md:translate-x-8" />
							</div>
							<div className="relative z-10 flex h-full flex-col justify-between">
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110 md:mb-4 md:h-12 md:w-12">
									<Palette className="h-5 w-5 text-primary md:h-6 md:w-6" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-base text-foreground md:text-lg">
										Customize
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-xs md:text-sm">
										Update your look
									</p>
								</div>
							</div>
						</div>
					</Link>
				</div>

				{/* Recent Links */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-foreground text-lg tracking-tight md:text-xl">
							Your Links
						</h2>
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="h-8 text-muted-foreground text-xs hover:text-foreground md:h-9 md:text-sm"
						>
							<Link href="/dashboard/links">View All</Link>
						</Button>
					</div>

					{links.length === 0 ? (
						<div className="rounded-xl border border-border border-dashed bg-muted/30 p-6 text-center md:p-8">
							<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted md:mb-4 md:h-12 md:w-12">
								<LinkIcon className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
							</div>
							<h3 className="mb-1 font-semibold text-foreground text-sm md:text-base">
								No links yet
							</h3>
							<p className="mb-4 text-muted-foreground text-xs md:text-sm">
								Your profile is empty. Add your first link to get started.
							</p>
							<Button asChild size="sm">
								<Link href="/dashboard/links">
									<Plus className="mr-2 h-4 w-4" />
									Add Link
								</Link>
							</Button>
						</div>
					) : (
						<div className="grid gap-3">
							{links.slice(0, 3).map((link) => (
								<div
									key={link.id}
									className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent hover:text-accent-foreground md:gap-4"
								>
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-hover:text-foreground md:h-10 md:w-10">
										<LinkIcon className="h-4 w-4 md:h-5 md:w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="truncate font-medium text-foreground text-sm md:text-base">
											{link.title}
										</h4>
										<p className="truncate text-muted-foreground text-xs">
											{link.url}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										asChild
										className="h-8 w-8 text-muted-foreground hover:text-foreground md:h-9 md:w-9"
									>
										{/* <Link href={link.url} target="_blank">
											<ExternalLink className="h-4 w-4" />
										</Link> */}
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Share Section */}
				<div className="rounded-xl border border-border bg-card p-1">
					<div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row">
						<div className="space-y-1 text-center sm:text-left">
							<h3 className="font-semibold text-foreground text-sm md:text-base">
								Share your Zaplink
							</h3>
							<p className="text-muted-foreground text-xs md:text-sm">
								Get more visitors by sharing your link.
							</p>
						</div>
						<div className="flex w-full gap-2 sm:w-auto">
							<Button
								variant="outline"
								onClick={handleCopyLink}
								size="sm"
								className="flex-1 sm:flex-none"
							>
								<Copy className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
								Copy
							</Button>
							<Button
								onClick={() => window.open(`/${profile.username}`, "_blank")}
								size="sm"
								className="flex-1 sm:flex-none"
							>
								<Share2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
								Open
							</Button>
						</div>
					</div>
				</div>
			</div>
		</PageWithPreview>
	);
}
