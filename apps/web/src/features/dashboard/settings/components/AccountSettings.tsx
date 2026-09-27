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
 * The limits below are the column widths in `profiles.display_name` and
 * `profiles.username` (both varchar(30)), not the looser ceilings the
 * updateProfile procedure accepts. Postgres rejects an over-long value with a
 * raw driver error, so the form has to be the stricter of the two.
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

/**
 * The username input carries a domain prefix, so it cannot use `FormControl`.
 * That component attaches the id, `aria-describedby` and `aria-invalid` to
 * whichever element it renders, and here that is the wrapper div around the
 * input rather than the input itself, which left the label pointing at a div,
 * the description announced for nothing, and the invalid state unreachable.
 *
 * Reading the ids off the field context puts them on the input where they
 * belong. That read is a hook, so it lives in its own component rendered inside
 * FormItem: a hook called by the component that renders FormItem would run
 * before that context provider exists and yield an id of "undefined".
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
		 * The domain is a flex sibling of the input inside one surface, rather
		 * than an absolutely positioned prefix with a hard-coded left padding.
		 * Same result, but the offset tracks the font instead of assuming it, so
		 * nothing overlaps when the font or the label changes.
		 *
		 * The wrapper carries the surface and the focus ring, and the Input's
		 * own ring is suppressed with the important modifier, so exactly one ring
		 * is ever visible. :has(:focus-visible) rather than focus-within keeps
		 * the ring keyboard-only, matching what the Input does on its own.
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
				// Seed the cache from the response instead of refetching: the
				// procedure returns the row it just wrote, and the live preview
				// and every other section read from this one cache entry.
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
