"use client";

import { useForm } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/features/dashboard/components/SaveBar";
import { UsernameField } from "@/features/dashboard/components/UsernameField";
import { ProfileImageUploader } from "@/features/onboarding/components/ProfileImageUploader";
import type { ProfileFormValues } from "@/lib/validation/profile";
import { BIO_MAX, profileFormSchema } from "@/lib/validation/profile";

/*
 * Derives the form's type: the api carries thirteen generics that only useForm
 * can fill in.
 */
export function useProfileForm({
	defaultValues,
	onSubmit,
}: {
	defaultValues: ProfileFormValues;
	onSubmit: (values: ProfileFormValues) => void;
}) {
	return useForm({
		defaultValues,
		validators: { onSubmit: profileFormSchema },
		onSubmit: ({ value }) => onSubmit(value),
	});
}

export type ProfileFormApi = ReturnType<typeof useProfileForm>;

interface ProfileFormProps {
	form: ProfileFormApi;
	isSubmitting: boolean;
	onAvatarFileChange: (file: File) => void;
	onBannerFileChange: (file: File) => void;
	onReset: () => void;
}

const BIO_ID = "profile-bio";
const NAME_ID = "profile-display-name";

export default function ProfileForm({
	form,
	isSubmitting,
	onAvatarFileChange,
	onBannerFileChange,
	onReset,
}: ProfileFormProps) {
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			<div className="grid gap-6 md:grid-cols-[6rem_1fr] md:items-start">
				<form.Field name="avatarUrl">
					{(field) => (
						<Field>
							<FieldLabel htmlFor="profile-avatar">Avatar</FieldLabel>
							<ProfileImageUploader
								imageUrl={field.state.value || null}
								onImageChange={field.handleChange}
								onFileChange={onAvatarFileChange}
								label="Avatar"
								endpoint="avatarUploader"
								sizeClass="aspect-square size-24 rounded-full"
							/>
						</Field>
					)}
				</form.Field>

				<form.Field name="bannerUrl">
					{(field) => (
						<Field>
							<FieldLabel htmlFor="profile-banner">Banner</FieldLabel>
							<ProfileImageUploader
								imageUrl={field.state.value || null}
								onImageChange={field.handleChange}
								onFileChange={onBannerFileChange}
								label="Banner"
								endpoint="bannerUploader"
								sizeClass="aspect-video w-full rounded-2xl"
							/>
							<FieldDescription>
								The wide image at the top of your profile.
							</FieldDescription>
						</Field>
					)}
				</form.Field>
			</div>

			<form.Field name="displayName">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;

					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={NAME_ID}>Display name</FieldLabel>
							<Input
								id={NAME_ID}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Your name"
								aria-invalid={isInvalid}
								aria-describedby={`${NAME_ID}-description`}
							/>
							<FieldDescription id={`${NAME_ID}-description`}>
								Shown at the top of your profile and in the browser tab.
							</FieldDescription>
							{isInvalid && (
								<FieldError
									id={`${NAME_ID}-error`}
									errors={field.state.meta.errors}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="username">
				{(field) => <UsernameField field={field} />}
			</form.Field>

			<form.Field name="bio">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;

					return (
						<Field data-invalid={isInvalid}>
							<div className="flex items-center justify-between gap-2">
								<FieldLabel htmlFor={BIO_ID}>Bio</FieldLabel>
								<span className="text-muted-foreground text-xs tabular-nums">
									{field.state.value?.length ?? 0}/{BIO_MAX}
								</span>
							</div>
							<Textarea
								id={BIO_ID}
								name={field.name}
								rows={3}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Tell us about yourself"
								aria-invalid={isInvalid}
								aria-describedby="profile-bio-description"
							/>
							<FieldDescription id="profile-bio-description">
								A sentence or two under your name.
							</FieldDescription>
							{isInvalid && (
								<FieldError
									id="profile-bio-error"
									errors={field.state.meta.errors}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			{/* Read through Subscribe: form.state is a snapshot and will not
			    re-render this on a field change. */}
			<form.Subscribe selector={(state) => state.isDirty}>
				{(isDirty) => (
					<SaveBar
						isDirty={isDirty}
						isSubmitting={isSubmitting}
						onReset={onReset}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
