"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc/client";

export function AccountSettings() {
	const { data: profile, isLoading } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-medium text-lg">Profile Information</h3>
				<p className="text-muted-foreground text-sm">
					Update your account's profile information and email address.
				</p>
			</div>
			{/* Form fields will go here */}
			<div className="grid gap-4">
				<div className="grid gap-2">
					<label htmlFor="username" className="font-medium text-sm">
						Username
					</label>
					<div className="rounded-md border bg-muted px-3 py-2 text-sm">
						{profile?.username}
					</div>
				</div>
				<div className="grid gap-2">
					<label htmlFor="email" className="font-medium text-sm">
						Display Name
					</label>
					<div className="rounded-md border bg-muted px-3 py-2 text-sm">
						{profile?.displayName}
					</div>
				</div>
			</div>
		</div>
	);
}
