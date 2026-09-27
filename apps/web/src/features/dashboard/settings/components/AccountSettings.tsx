"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SaveBar } from "@/features/dashboard/components/SaveBar";
import { UsernameField } from "@/features/dashboard/components/UsernameField";
import type { AccountFormValues } from "@/lib/validation/profile";
import { accountFormSchema } from "@/lib/validation/profile";
import type { ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";

interface AccountSettingsProps {
	profile: ProfileData;
}

const DISPLAY_NAME_ID = "account-display-name";

export function AccountSettings({ profile }: AccountSettingsProps) {
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Account updated");
				// Seeded from the response rather than refetched, since every reader
				// shares this one cache entry.
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

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName ?? "",
			username: profile.username ?? "",
		} satisfies AccountFormValues,
		validators: { onSubmit: accountFormSchema },
		onSubmit: ({ value }) => {
			updateProfileMutation.mutate(value);
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
			className="space-y-5"
		>
			<form.Field name="displayName">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;

					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={DISPLAY_NAME_ID}>Display name</FieldLabel>
							<Input
								id={DISPLAY_NAME_ID}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Your name"
								aria-invalid={isInvalid}
								aria-describedby={`${DISPLAY_NAME_ID}-description`}
							/>
							<FieldDescription id={`${DISPLAY_NAME_ID}-description`}>
								Shown at the top of your profile and in the browser tab.
							</FieldDescription>
							{isInvalid && (
								<FieldError
									id={`${DISPLAY_NAME_ID}-error`}
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

			{/*
			 * isDirty has to be read through Subscribe. form.state is a plain
			 * snapshot, so reading it during render does not re-run this
			 * component when a field changes, and the bar stayed pristine.
			 */}
			<form.Subscribe selector={(state) => state.isDirty}>
				{(isDirty) => (
					<SaveBar
						isDirty={isDirty}
						isSubmitting={updateProfileMutation.isPending}
						onReset={() => form.reset()}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
