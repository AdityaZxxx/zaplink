"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileImageUploader } from "@/features/onboarding/components/ProfileImageUploader";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import { useUploadThing } from "@/utils/uploadthing";

const profileSchema = z.object({
	displayName: z.string().min(1, "Display name is required").max(50),
	username: z.string().min(3, "Username must be at least 3 characters").max(30),
	bio: z.string().max(160).optional(),
	avatarUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

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

			// Upload avatar if changed
			if (avatarFile) {
				const res = await uploadAvatar([avatarFile]);
				if (res?.[0]) {
					finalAvatarUrl = res[0].url;
				} else {
					throw new Error("Failed to upload avatar");
				}
			}

			// Upload banner if changed
			if (bannerFile) {
				const res = await uploadBanner([bannerFile]);
				if (res?.[0]) {
					finalBannerUrl = res[0].url;
				} else {
					throw new Error("Failed to upload banner");
				}
			}

			// Safety check: NEVER submit a blob URL
			if (finalAvatarUrl?.startsWith("blob:")) {
				throw new Error("Invalid avatar URL. Please try uploading again.");
			}
			if (finalBannerUrl?.startsWith("blob:")) {
				throw new Error("Invalid banner URL. Please try uploading again.");
			}

			// Submit with final URLs
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

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="space-y-8"
			>
				{/* Avatar & Banner Section */}
				<div className="space-y-4 rounded-xl border p-6">
					<h3 className="font-semibold text-lg">Appearance</h3>
					<div className="grid gap-6 md:grid-cols-2">
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
											sizeClass="h-24 w-24 rounded-full"
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
											sizeClass="h-24 w-full rounded-lg aspect-video"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Basic Info Section */}
				<div className="space-y-4 rounded-xl border p-6">
					<h3 className="font-semibold text-lg">Basic Information</h3>

					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Display Name</FormLabel>
								<FormControl>
									<Input placeholder="Your Name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<div className="flex rounded-md shadow-sm ring-1 ring-input ring-inset focus-within:ring-2 focus-within:ring-ring">
										<span className="flex select-none items-center pl-3 text-muted-foreground text-sm">
											{DOMAIN_NAME}/
										</span>
										<input
											{...field}
											className="block flex-1 border-0 bg-transparent py-2 pl-1 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm sm:leading-6"
											placeholder="username"
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="bio"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Bio</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Tell us about yourself"
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<div className="text-right text-muted-foreground text-xs">
									{field.value?.length || 0}/160
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => form.reset()}
						disabled={!form.formState.isDirty || isSubmitting}
					>
						Reset
					</Button>
					<Button
						type="submit"
						disabled={!form.formState.isDirty || isSubmitting}
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</div>
			</form>
		</Form>
	);
}
