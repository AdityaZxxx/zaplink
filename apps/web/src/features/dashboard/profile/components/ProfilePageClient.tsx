"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import {
	PROFILE_CARD_PREVIEW_CLASS,
	ProfileCard,
} from "@/features/profile/components";
import type { ProfileFormValues } from "@/lib/validation/profile";
import { profileFormSchema } from "@/lib/validation/profile";
import type { LinksData, ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";
import ProfileForm from "./ProfileForm";

interface ProfilePageClientProps {
	initialProfile: ProfileData;
	initialLinks: LinksData;
}

export default function ProfilePageClient({
	initialProfile,
	initialLinks,
}: ProfilePageClientProps) {
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Profile updated");
				// Seeded from the response, since the preview reads this same entry.
				queryClient.setQueryData(
					trpc.profile.getProfile.queryOptions().queryKey,
					updated,
				);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			displayName: initialProfile.displayName ?? "",
			username: initialProfile.username ?? "",
			bio: initialProfile.bio ?? "",
			avatarUrl: initialProfile.avatarUrl ?? "",
			bannerUrl: initialProfile.bannerUrl ?? "",
		},
	});

	const watchedValues = form.watch();

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
					className={PROFILE_CARD_PREVIEW_CLASS}
				/>
			}
		>
			<div className="space-y-6">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">Profile</h1>
					<p className="text-muted-foreground">
						How you look and what you say on your public page.
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
