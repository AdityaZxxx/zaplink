"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { links, profiles } from "@zaplink/db";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import { ProfileCard } from "@/features/profile/components";
import { queryClient, trpc } from "@/utils/trpc/client";
import ProfileForm, { type ProfileFormValues } from "./ProfileForm";

type Profile = typeof profiles.$inferSelect;
type Link = typeof links.$inferSelect;

interface ProfilePageClientProps {
	initialProfile: Profile;
	initialLinks: Link[];
}

const profileSchema = z.object({
	displayName: z.string().min(1, "Display name is required").max(50),
	username: z.string().min(3, "Username must be at least 3 characters").max(30),
	bio: z.string().max(160).optional(),
	avatarUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
});

export default function ProfilePageClient({
	initialProfile,
	initialLinks,
}: ProfilePageClientProps) {
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: () => {
				toast.success("Profile updated successfully");
				queryClient.invalidateQueries({
					queryKey: ["profile"],
				});
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			displayName: initialProfile.displayName || "",
			username: initialProfile.username || "",
			bio: initialProfile.bio || "",
			avatarUrl: initialProfile.avatarUrl || "",
			bannerUrl: initialProfile.bannerUrl || "",
		},
	});

	// Watch all fields for real-time preview
	const watchedValues = form.watch();

	// Merge watched values with initial profile to create a preview object
	// We cast to any because of Date vs string mismatch issues and partial updates
	const previewProfile = {
		...initialProfile,
		...watchedValues,
	} as any;

	const onSubmit = (values: ProfileFormValues) => {
		updateProfileMutation.mutate(values);
	};

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					profile={previewProfile}
					links={initialLinks} // Links are managed in a separate page, so we use initial ones
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			<div className="space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Profile</h1>
					<p className="text-muted-foreground">
						Manage your public profile information.
					</p>
				</div>

				<ProfileForm
					form={form}
					onSubmit={onSubmit}
					isSubmitting={updateProfileMutation.isPending}
				/>
			</div>
		</PageWithPreview>
	);
}
