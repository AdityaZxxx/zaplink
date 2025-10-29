"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../../../../components/loader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { trpc } from "../../../../utils/trpc/client";

export default function UsernamePage() {
	const [username, setUsername] = useState("");
	const router = useRouter();

	const { data: profile, isLoading: isProfileLoading } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);

	useEffect(() => {
		if (!isProfileLoading && profile) {
			router.replace("/dashboard");
		}
	}, [profile, isProfileLoading, router]);

	const createProfile = useMutation(
		trpc.profile.createProfile.mutationOptions({
			onSuccess: () => {
				router.push("/starter-link");
				toast.success("Username created successfully!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createProfile.mutate({ username });
	};

	if (isProfileLoading || profile) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center">
				<Loader />
			</main>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto mb-36 w-full max-w-md">
				<h1 className="mb-2 text-center font-bold text-3xl">
					Your Zaplink Username
				</h1>
				<p className="mb-6 text-center text-muted-foreground text-sm">
					💡Tip: use the same one as your Social Media
				</p>
				<form
					onSubmit={handleSubmit}
					className="flex w-full flex-col items-center justify-center gap-2"
				>
					<div className="flex w-full flex-row items-center justify-center gap-2">
						<p className="rounded-md border-2 border-primary border-dashed px-2 py-1 text-center text-base text-muted-foreground">
							zaplink.com/
						</p>
						<Input
							placeholder="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={createProfile.isPending}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={createProfile.isPending}
					>
						{createProfile.isPending ? "Saving..." : "Save"}
					</Button>
				</form>
			</div>
		</main>
	);
}
