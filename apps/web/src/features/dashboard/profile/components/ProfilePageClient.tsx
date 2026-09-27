"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import { useProfileUploads } from "@/features/dashboard/profile/useProfileUploads";
import {
	PROFILE_CARD_PREVIEW_CLASS,
	ProfileCard,
} from "@/features/profile/components";
import type { ProfileFormValues } from "@/lib/validation/profile";
import type { LinksData, ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";
import ProfileForm, {
	type ProfileFormApi,
	useProfileForm,
} from "./ProfileForm";

interface ProfilePageClientProps {
	initialProfile: ProfileData;
	initialLinks: LinksData;
}

/*
 * Subscribes rather than reading form.state.values once, so the preview
 * follows typing instead of waiting for an unrelated re-render.
 */
function ProfilePreview({
	form,
	initialProfile,
	links,
}: {
	form: ProfileFormApi;
	initialProfile: ProfileData;
	links: LinksData;
}) {
	return (
		<form.Subscribe selector={(state) => state.values}>
			{(values) => (
				<ProfileCard
					profile={{ ...initialProfile, ...values }}
					links={links}
					className={PROFILE_CARD_PREVIEW_CLASS}
				/>
			)}
		</form.Subscribe>
	);
}

export default function ProfilePageClient({
	initialProfile,
	initialLinks,
}: ProfilePageClientProps) {
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Changes saved");
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

	const uploads = useProfileUploads((values) =>
		updateProfileMutation.mutate(values),
	);

	const form = useProfileForm({
		defaultValues: {
			displayName: initialProfile.displayName ?? "",
			username: initialProfile.username ?? "",
			bio: initialProfile.bio ?? "",
			avatarUrl: initialProfile.avatarUrl ?? "",
			bannerUrl: initialProfile.bannerUrl ?? "",
		} satisfies ProfileFormValues,
		onSubmit: uploads.submit,
	});

	return (
		<PageWithPreview
			preview={
				<ProfilePreview
					form={form}
					initialProfile={initialProfile}
					links={initialLinks}
				/>
			}
		>
			<div className="space-y-6">
				<div className="space-y-1">
					<h1 className="text-title">Profile</h1>
					<p className="text-muted-foreground">
						Your photo, banner, name and bio, as visitors see them.
					</p>
				</div>

				<ProfileForm
					form={form}
					isSubmitting={updateProfileMutation.isPending || uploads.isUploading}
					onAvatarFileChange={uploads.setAvatarFile}
					onBannerFileChange={uploads.setBannerFile}
					onReset={() => form.reset()}
				/>
			</div>
		</PageWithPreview>
	);
}
