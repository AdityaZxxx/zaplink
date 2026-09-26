"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/constants/BRANDS";
import { queryClient, trpc } from "@/utils/trpc/client";

const seoFormSchema = z.object({
	seoTitle: z
		.string()
		.max(60, "Title must be less than 60 characters")
		.optional(),
	seoDescription: z
		.string()
		.max(160, "Description must be less than 160 characters")
		.optional(),
});

type SeoFormValues = z.infer<typeof seoFormSchema>;

export function SeoSettings() {
	const { data: profile } = useQuery(trpc.profile.getProfile.queryOptions());

	const form = useForm<SeoFormValues>({
		resolver: zodResolver(seoFormSchema),
		defaultValues: {
			seoTitle: profile?.seoTitle || "",
			seoDescription: profile?.seoDescription || "",
		},
	});

	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: () => {
				toast.success("SEO settings updated");
				queryClient.invalidateQueries(trpc.profile.getProfile.queryOptions());
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	function onSubmit(data: SeoFormValues) {
		updateProfileMutation.mutate(data);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-medium text-lg">SEO Configuration</h3>
				<p className="text-muted-foreground text-sm">
					Manage how your profile appears in search engine results.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="seoTitle"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>Meta Title</FormLabel>
									<span className="text-[10px] text-muted-foreground tabular-nums">
										{field.value?.length || 0}/60
									</span>
								</div>
								<FormControl>
									<Input
										placeholder="My Awesome Profile"
										maxLength={60}
										{...field}
									/>
								</FormControl>
								<FormDescription>Example: {profile?.username}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="seoDescription"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>Meta Description</FormLabel>
									<span className="text-[10px] text-muted-foreground tabular-nums">
										{field.value?.length || 0}/160
									</span>
								</div>
								<FormControl>
									<Textarea
										placeholder="Check out my links and content..."
										className="resize-none"
										maxLength={160}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Example: {APP_NAME}. Make engaging and relevant link sharing.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={updateProfileMutation.isPending}>
						{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</form>
			</Form>
		</div>
	);
}
