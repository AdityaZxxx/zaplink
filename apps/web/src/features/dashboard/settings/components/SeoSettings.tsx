"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { cn } from "cn";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import { queryClient, trpc } from "@/utils/trpc/client";
import type { ProfileData } from "../types";
import { SettingsSaveBar } from "./SettingsSaveBar";

/*
 * `profiles.seo_title` is varchar(30), which is the real ceiling. The
 * updateProfile procedure allows 60, so a longer title passes validation and
 * then fails on insert; the narrower limit is enforced here to match the
 * column. Widening the column is the real fix, and it is a migration.
 */
const SEO_TITLE_MAX = 30;
const SEO_DESCRIPTION_MAX = 160;

/*
 * Google's own link colours for a result, not project tokens. This block
 * previews a surface that lives outside the app, so it has to match that
 * surface rather than the design system. The light and dark steps are the two
 * Google uses for each theme.
 */
const SERP_LINK = "text-[#1a0dab] dark:text-[#8ab4f8]";

const seoFormSchema = z.object({
	seoTitle: z
		.string()
		.max(SEO_TITLE_MAX, `Title must be ${SEO_TITLE_MAX} characters or fewer`)
		.optional(),
	seoDescription: z
		.string()
		.max(
			SEO_DESCRIPTION_MAX,
			`Description must be ${SEO_DESCRIPTION_MAX} characters or fewer`,
		)
		.optional(),
});

type SeoFormValues = z.infer<typeof seoFormSchema>;

interface SeoSettingsProps {
	profile: ProfileData;
}

/**
 * A counter that changes colour as the field fills, so running out of room is
 * visible before it is a validation error. `tabular-nums` keeps the digits from
 * shifting the label as they tick.
 */
function CharacterCount({ value, max }: { value?: string; max: number }) {
	const length = value?.length ?? 0;
	const remaining = max - length;

	return (
		<span
			className={cn(
				"text-xs tabular-nums",
				// A colour change, not a warning toast: the limit is a fact about
				// the field, and it stays legible with motion switched off.
				remaining <= 0
					? "text-destructive"
					: remaining <= Math.max(1, Math.round(max * 0.1))
						? "text-foreground"
						: "text-muted-foreground",
			)}
		>
			{length}/{max}
		</span>
	);
}

export function SeoSettings({ profile }: SeoSettingsProps) {
	const form = useForm<SeoFormValues>({
		resolver: zodResolver(seoFormSchema),
		defaultValues: {
			seoTitle: profile.seoTitle ?? "",
			seoDescription: profile.seoDescription ?? "",
		},
	});

	// Watch both fields so the result preview tracks typing. The phone preview
	// beside this panel shows the profile, not the meta tags, so without this
	// the two halves of the page would disagree about what is being edited.
	const [seoTitle, seoDescription] = form.watch(["seoTitle", "seoDescription"]);

	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Search settings updated");
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

	// What search engines fall back to when a field is blank, mirroring the
	// fallbacks in generateMetadata on the public profile route.
	const resolvedTitle = seoTitle || profile.displayName || profile.username;
	const resolvedDescription = seoDescription || profile.bio;

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
					name="seoTitle"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between gap-2">
								<FormLabel>Meta title</FormLabel>
								<CharacterCount value={field.value} max={SEO_TITLE_MAX} />
							</div>
							<FormControl>
								<Input
									placeholder={profile.displayName ?? "Your name"}
									{...field}
								/>
							</FormControl>
							<FormDescription>
								The headline in search results. Leave blank to use your display
								name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="seoDescription"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between gap-2">
								<FormLabel>Meta description</FormLabel>
								<CharacterCount value={field.value} max={SEO_DESCRIPTION_MAX} />
							</div>
							<FormControl>
								<Textarea
									rows={3}
									placeholder={
										profile.bio ?? "A sentence about what you share."
									}
									{...field}
								/>
							</FormControl>
							<FormDescription>
								The summary under the title. Leave blank to use your bio.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/*
				 * The point of the section: these two fields exist to change a
				 * search result, so the page shows one. It previews the fields as
				 * they are typed, not as they are saved, because deciding on a
				 * title needs to happen before committing to it.
				 */}
				<div className="rounded-2xl border bg-muted/40 p-4">
					<p className="font-medium text-muted-foreground text-xs">
						Search result preview
					</p>
					<div className="mt-3 space-y-1">
						<p className={`truncate text-sm ${SERP_LINK}`}>
							{DOMAIN_NAME}/{profile.username}
						</p>
						<p className={`truncate text-lg leading-snug ${SERP_LINK}`}>
							{resolvedTitle}
						</p>
						<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
							{resolvedDescription ??
								"Nothing to show yet. Add a description to see it here."}
						</p>
					</div>
				</div>

				<SettingsSaveBar
					isDirty={form.formState.isDirty}
					isSubmitting={updateProfileMutation.isPending}
					onReset={() => form.reset()}
				/>
			</form>
		</Form>
	);
}
