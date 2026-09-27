"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ProfileFormValues } from "@/lib/validation/profile";
import { useUploadThing } from "@/utils/uploadthing";

/*
 * Runs inside the form's onSubmit, the only place after validation and before
 * the mutation. Outside it, a blob URL would reach the database.
 */
export function useProfileUploads(
	onSubmit: (values: ProfileFormValues) => void,
) {
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const { startUpload: uploadAvatar } = useUploadThing("avatarUploader");
	const { startUpload: uploadBanner } = useUploadThing("bannerUploader");

	const submit = async (values: ProfileFormValues) => {
		try {
			setIsUploading(true);
			let finalAvatarUrl = values.avatarUrl;
			let finalBannerUrl = values.bannerUrl;

			if (avatarFile) {
				const res = await uploadAvatar([avatarFile]);
				if (res?.[0]) {
					finalAvatarUrl = res[0].url;
				} else {
					throw new Error("Failed to upload avatar");
				}
			}

			if (bannerFile) {
				const res = await uploadBanner([bannerFile]);
				if (res?.[0]) {
					finalBannerUrl = res[0].url;
				} else {
					throw new Error("Failed to upload banner");
				}
			}

			// A blob URL here would be written to the database.
			if (finalAvatarUrl?.startsWith("blob:")) {
				throw new Error("Invalid avatar URL. Please try uploading again.");
			}
			if (finalBannerUrl?.startsWith("blob:")) {
				throw new Error("Invalid banner URL. Please try uploading again.");
			}

			onSubmit({
				...values,
				avatarUrl: finalAvatarUrl,
				bannerUrl: finalBannerUrl,
			});
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update profile",
			);
		} finally {
			setIsUploading(false);
		}
	};

	return {
		setAvatarFile,
		setBannerFile,
		isUploading,
		submit,
	};
}
