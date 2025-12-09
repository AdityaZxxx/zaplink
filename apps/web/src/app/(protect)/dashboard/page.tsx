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
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import { ProfileCard } from "@/features/profile/components";
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
			<div className="space-y-8 pb-20 md:pb-0">
				{/* Welcome Section */}
				<div className="flex flex-col gap-2">
					<h1 className="bg-linear-to-r from-white to-zinc-400 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl">
						Welcome back, {profile.displayName}!
					</h1>
					<p className="text-zinc-400">
						Here's what's happening with your profile today.
					</p>
				</div>

				{/* Quick Stats - Horizontal Scroll on Mobile */}
				<div className="-mx-4 hide-scrollbar overflow-x-auto px-4 pb-4 md:mx-0 md:px-0 md:pb-0">
					<div className="flex min-w-max gap-4 md:grid md:min-w-0 md:grid-cols-3">
						<Card className="w-[280px] border-zinc-800 bg-zinc-900/50 backdrop-blur-sm md:w-auto">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="font-medium text-sm text-zinc-400">
									Total Links
								</CardTitle>
								<LinkIcon className="h-4 w-4 text-zinc-500" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-white">
									{links.length}
								</div>
								<p className="text-xs text-zinc-500">Active on your profile</p>
							</CardContent>
						</Card>
						<Card className="w-[280px] border-zinc-800 bg-zinc-900/50 backdrop-blur-sm md:w-auto">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="font-medium text-sm text-zinc-400">
									Total Views
								</CardTitle>
								<BarChart3 className="h-4 w-4 text-zinc-500" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-white">0</div>
								<p className="text-xs text-zinc-500">Coming soon</p>
							</CardContent>
						</Card>
						<Card className="w-[280px] border-zinc-800 bg-zinc-900/50 backdrop-blur-sm md:w-auto">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="font-medium text-sm text-zinc-400">
									Profile Status
								</CardTitle>
								<div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-white">Active</div>
								<p className="text-xs text-zinc-500">Visible to public</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid gap-4 md:grid-cols-2">
					<Link href="/dashboard/links" className="group">
						<div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-linear-to-br from-violet-500/10 via-zinc-900 to-zinc-900 p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
							<div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
								<Plus className="-translate-y-8 h-24 w-24 translate-x-8 rotate-12 transform text-violet-500" />
							</div>
							<div className="relative z-10">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 transition-transform group-hover:scale-110">
									<Plus className="h-6 w-6 text-violet-400" />
								</div>
								<h3 className="mb-1 font-semibold text-lg text-white">
									Add New Link
								</h3>
								<p className="text-sm text-zinc-400">
									Share something new with your audience
								</p>
							</div>
						</div>
					</Link>
					<Link href="/dashboard/profile" className="group">
						<div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-linear-to-br from-pink-500/10 via-zinc-900 to-zinc-900 p-6 transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)]">
							<div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
								<Palette className="-rotate-12 -translate-y-8 h-24 w-24 translate-x-8 transform text-pink-500" />
							</div>
							<div className="relative z-10">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20 transition-transform group-hover:scale-110">
									<Palette className="h-6 w-6 text-pink-400" />
								</div>
								<h3 className="mb-1 font-semibold text-lg text-white">
									Customize Profile
								</h3>
								<p className="text-sm text-zinc-400">
									Update your look and feel
								</p>
							</div>
						</div>
					</Link>
				</div>

				{/* Recent Links */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-white text-xl tracking-tight">
							Your Links
						</h2>
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="text-zinc-400 hover:text-white"
						>
							<Link href="/dashboard/links">View All</Link>
						</Button>
					</div>

					{links.length === 0 ? (
						<div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
								<LinkIcon className="h-6 w-6 text-zinc-500" />
							</div>
							<h3 className="mb-1 font-semibold text-white">No links yet</h3>
							<p className="mb-4 text-sm text-zinc-500">
								Your profile is empty. Add your first link to get started.
							</p>
							<Button asChild className="bg-white text-black hover:bg-zinc-200">
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
									className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/80"
								>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors group-hover:text-white">
										<LinkIcon className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="truncate font-medium text-zinc-200 transition-colors group-hover:text-white">
											{link.title}
										</h4>
										<p className="truncate text-xs text-zinc-500">{link.url}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										asChild
										className="text-zinc-500 hover:text-white"
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
				<div className="rounded-xl border border-zinc-800 bg-linear-to-r from-zinc-900 to-zinc-800 p-1">
					<div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-zinc-950/50 p-4 sm:flex-row">
						<div className="space-y-1 text-center sm:text-left">
							<h3 className="font-semibold text-white">Share your Zaplink</h3>
							<p className="text-sm text-zinc-400">
								Get more visitors by sharing your link.
							</p>
						</div>
						<div className="flex w-full gap-2 sm:w-auto">
							<Button
								variant="outline"
								onClick={handleCopyLink}
								className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 sm:flex-none"
							>
								<Copy className="mr-2 h-4 w-4" />
								Copy
							</Button>
							<Button
								onClick={() => window.open(`/${profile.username}`, "_blank")}
								className="flex-1 bg-white text-black hover:bg-zinc-200 sm:flex-none"
							>
								<Share2 className="mr-2 h-4 w-4" />
								Open
							</Button>
						</div>
					</div>
				</div>
			</div>
		</PageWithPreview>
	);
}
