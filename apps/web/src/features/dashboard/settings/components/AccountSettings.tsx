"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { SaveBar } from "@/features/dashboard/components/SaveBar";
import { UsernameField } from "@/features/dashboard/components/UsernameField";
import type { AccountFormValues } from "@/lib/validation/profile";
import { accountFormSchema } from "@/lib/validation/profile";
import type { ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";

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

				<SaveBar
					isDirty={form.formState.isDirty}
					isSubmitting={isSubmitting}
					onReset={() => form.reset()}
				/>
			</form>
		</Form>
	);
}
