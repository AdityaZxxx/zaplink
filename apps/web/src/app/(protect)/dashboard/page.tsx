import { Edit3, Link2, Share2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth-server";

export default async function DashboardPage() {
	const session = await getSession();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<main className="container mx-auto max-w-5xl px-4 py-8">
			<h1 className="mb-8 font-bold text-3xl">Welcome {session?.user.name}</h1>
			<div className="grid grid-cols-2 gap-8">
				<EditLink />
				<SocialLinks />
				<ShareLink />
			</div>
		</main>
	);
}

const EditLink = () => {
	return (
		<Link href="/dashboard/profile">
			<Card className="border bg-card shadow-md transition-all duration-300 hover:shadow-lg">
				<CardContent className="space-y-4 pt-2 pb-4 text-center">
					<div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-primary">
						<Link2 className="h-8 w-8" />
					</div>
					<h3 className="font-semibold text-xl">Manage Profile</h3>
					<p className="text-muted-foreground leading-relaxed">
						Manage your Title, Subtitle, Username and other details
					</p>
				</CardContent>
			</Card>
		</Link>
	);
};

const SocialLinks = () => {
	return (
		<Link href="/dashboard/links">
			<Card className="border bg-card shadow-md transition-all duration-300 hover:shadow-lg">
				<CardContent className="space-y-4 pt-2 pb-4 text-center">
					<div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-primary">
						<Edit3 className="h-8 w-8" />
					</div>
					<h3 className="font-semibold text-xl">Edit Link</h3>
					<p className="text-muted-foreground leading-relaxed">
						Add, edit, or remove link in popular social platforms
					</p>
				</CardContent>
			</Card>
		</Link>
	);
};

const ShareLink = () => {
	return (
		<div>
			<Card className="border bg-card shadow-md transition-all duration-300 hover:shadow-lg">
				<CardContent className="space-y-4 pt-2 pb-4 text-center">
					<div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-primary">
						<Share2 className="h-8 w-8" />
					</div>
					<h3 className="font-semibold text-xl">Share Link</h3>
					<p className="text-muted-foreground leading-relaxed">
						Share your link with your friends
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
