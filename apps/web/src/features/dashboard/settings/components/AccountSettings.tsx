"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ControllerRenderProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import type { ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";
import { SettingsSaveBar } from "./SettingsSaveBar";

/*
 * These are the column widths (both varchar(30)), narrower than the
 * ceilings updateProfile accepts, so an over-long value fails on insert.
 */
const accountFormSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(30, "Display name must be 30 characters or fewer"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be 30 characters or fewer"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

/*
 * FormControl puts the id and aria-describedby on the wrapper div rather
 * than the input, and the pl-[95px] prefix this replaces was narrower than
 * "zaplink.com/" at this font. The useFormField read is a hook, so it needs
 * its own component inside FormItem.
 */
function UsernameField({
	field,
}: {
	field: ControllerRenderProps<AccountFormValues, "username">;
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
	field: ControllerRenderProps<AccountFormValues, "username">;
}) {
	const { formItemId, formDescriptionId, formMessageId, error } =
		useFormField();

	return (
		/*
		 * The wrapper owns the ring and the Input's is suppressed with the
		 * important modifier, so only one ring shows.
		 */
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

interface AccountSettingsProps {
	profile: ProfileData;
}

export function AccountSettings({ profile }: AccountSettingsProps) {
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			displayName: profile.displayName ?? "",
			username: profile.username ?? "",
		},
	});

	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Account updated");
				// Seeded from the response rather than refetched, since every reader
				// // shares this one cache entry.
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

	const isSubmitting = updateProfileMutation.isPending;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((values) =>
					updateProfileMutation.mutate(values),
				)}
				className="space-y-5"
			>
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

				<SettingsSaveBar
					isDirty={form.formState.isDirty}
					isSubmitting={isSubmitting}
					onReset={() => form.reset()}
				/>
			</form>
		</Form>
	);
}
