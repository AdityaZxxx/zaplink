"use client";

import { useState } from "react";
import type { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/features/dashboard/components/SaveBar";
import { UsernameField } from "@/features/dashboard/components/UsernameField";
import { ProfileImageUploader } from "@/features/onboarding/components/ProfileImageUploader";
import type { ProfileFormValues } from "@/lib/validation/profile";
import { BIO_MAX } from "@/lib/validation/profile";
import { useUploadThing } from "@/utils/uploadthing";

interface ProfileFormProps {
	form: ReturnType<typeof useForm<ProfileFormValues>>;
	onSubmit: (values: ProfileFormValues) => void;
	isSubmitting?: boolean;
}

export default function ProfileForm({
	form,
	onSubmit,
	isSubmitting: parentIsSubmitting,
}: ProfileFormProps) {
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const { startUpload: uploadAvatar } = useUploadThing("avatarUploader");
	const { startUpload: uploadBanner } = useUploadThing("bannerUploader");

	const handleFormSubmit = async (values: ProfileFormValues) => {
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

	const isSubmitting = parentIsSubmitting || isUploading;
	const isDirty = form.formState.isDirty;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="space-y-6"
			>
				<div className="grid gap-6 md:grid-cols-[6rem_1fr] md:items-start">
					<FormField
						control={form.control}
						name="avatarUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Avatar</FormLabel>
								<FormControl>
									<ProfileImageUploader
										imageUrl={field.value || null}
										onImageChange={field.onChange}
										onFileChange={setAvatarFile}
										label="Avatar"
										endpoint="avatarUploader"
										sizeClass="aspect-square size-24 rounded-full"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="bannerUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Banner</FormLabel>
								<FormControl>
									<ProfileImageUploader
										imageUrl={field.value || null}
										onImageChange={field.onChange}
										onFileChange={setBannerFile}
										label="Banner"
										endpoint="bannerUploader"
										sizeClass="aspect-video w-full rounded-2xl"
									/>
								</FormControl>
								<FormDescription>
									The wide image at the top of your profile.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="displayName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Display name</FormLabel>
							<FormControl>
								<Input placeholder="Your name" {...field} />
							</FormControl>
							<FormDescription>
								Shown at the top of your profile and in the browser tab.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => <UsernameField field={field} />}
				/>

				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between gap-2">
								<FormLabel>Bio</FormLabel>
								<span className="text-muted-foreground text-xs tabular-nums">
									{field.value?.length ?? 0}/{BIO_MAX}
								</span>
							</div>
							<FormControl>
								<Textarea
									rows={3}
									placeholder="Tell us about yourself"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								A sentence or two under your name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<SaveBar
					isDirty={isDirty}
					isSubmitting={isSubmitting}
					onReset={() => form.reset()}
				/>
			</form>
		</Form>
	);
}

/*
 * FormControl puts the id and aria-describedby on the wrapper div rather
 * than the input, and the pl-[95px] prefix this replaces was narrower than
 * "zaplink.com/" at this font. The useFormField read is a hook, so it needs
 * its own component inside FormItem.
 */
