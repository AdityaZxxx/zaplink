"use client";

import { Spinner } from "@phosphor-icons/react";
import { useState } from "react";
import type { ControllerRenderProps, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileImageUploader } from "@/features/onboarding/components/ProfileImageUploader";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import { useUploadThing } from "@/utils/uploadthing";

/*
 * The limits are the column widths in `profiles.display_name` and
 * `profiles.username` (both varchar(30)), not the looser ceilings the
 * updateProfile procedure accepts. Postgres rejects an over-long value with a
 * raw driver error, so the form has to be the stricter of the two.
 */
const profileSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(30, "Display name must be 30 characters or fewer"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be 30 characters or fewer"),
	bio: z.string().max(160, "Bio must be 160 characters or fewer").optional(),
	avatarUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

const BIO_MAX = 160;

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
	const isDirty = form.formState.isDirty;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="space-y-6"
			>
				{/*
				 * Avatar and banner share a row on large screens. The avatar takes
				 * its own width and the banner fills the rest, rather than an even
				 * split: a square avatar has no use for half a column, and a 50/50
				 * grid shrank the banner to a thumbnail of itself.
				 */}
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
								{/*
								 * No description here. In a 6rem column a sentence
								 * wrapped to four lines beside a picture that already
								 * says what it is. The banner keeps one because a wide
								 * image is ambiguous in a way a square one is not.
								 */}
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
							{/*
							 * The count sits beside the label rather than under the
							 * field, matching the SEO section. Under the field it read
							 * as a caption for the textarea instead of a limit on it.
							 */}
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

				{/*
				 * justify-between with a left slot, so the note appearing on the
				 * first keystroke does not slide the buttons sideways. An empty
				 * paragraph still holds the row height.
				 */}
				<div className="flex items-center justify-between gap-3 border-t pt-4">
					<p aria-live="polite" className="text-muted-foreground text-xs">
						{isDirty ? "Unsaved changes" : null}
					</p>
					<div className="flex shrink-0 items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							disabled={!isDirty || isSubmitting}
						>
							Reset
						</Button>
						<Button type="submit" disabled={!isDirty || isSubmitting}>
							{/*
							 * The label never swaps to "Saving...". A spinner beside a
							 * stable label keeps the button the same width, so the row
							 * does not reflow mid-submit.
							 */}
							{isSubmitting && <Spinner className="animate-spin" />}
							Save changes
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

/**
 * The username input carries a domain prefix, so it cannot use `FormControl`.
 * That component attaches the id, `aria-describedby` and `aria-invalid` to
 * whichever element it renders, and here that was the wrapper div rather than
 * the input, so the label pointed at a div and the description was announced
 * for nothing.
 *
 * It also used an absolutely positioned prefix with `pl-[95px]`. The prefix is
 * a wider string than 95px at this font, so the value began flush against
 * "zaplink.com/" with no gap. A flex sibling sizes itself instead.
 *
 * The read of the generated ids is a hook, so it lives in its own component
 * rendered inside FormItem: a hook called by the component that renders
 * FormItem would run before that context provider exists.
 */
function UsernameField({
	field,
}: {
	field: ControllerRenderProps<ProfileFormValues, "username">;
}) {
	return (
		<FormItem>
			<FormLabel>Username</FormLabel>
			<UsernameInput field={field} />
			<FormDescription>
				Your profile lives at this address. Changing it breaks any link already
				shared.
			</FormDescription>
			<FormMessage />
		</FormItem>
	);
}

function UsernameInput({
	field,
}: {
	field: ControllerRenderProps<ProfileFormValues, "username">;
}) {
	const { formItemId, formDescriptionId, formMessageId, error } =
		useFormField();

	return (
		<div className="flex items-center rounded-2xl bg-input/50 transition-[color,box-shadow] duration-200 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30">
			<span className="select-none ps-3 font-medium text-muted-foreground text-sm">
				{DOMAIN_NAME}/
			</span>
			<Input
				{...field}
				id={formItemId}
				aria-describedby={
					error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
				}
				aria-invalid={!!error}
				placeholder="username"
				className="min-w-0 flex-1 bg-transparent ps-0 focus-visible:border-0! focus-visible:ring-0!"
			/>
		</div>
	);
}
