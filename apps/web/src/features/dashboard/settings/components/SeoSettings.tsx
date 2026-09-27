"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { cn } from "cn";
import { toast } from "sonner";
import { z } from "zod";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/features/dashboard/components/SaveBar";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import type { ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";

/*
 * seo_title is varchar(30), narrower than the 60 the update procedure
 * accepts, so an over-long value fails on insert.
 */
const SEO_TITLE_MAX = 30;
const SEO_DESCRIPTION_MAX = 160;

/*
 * Google's result colours, not project tokens: this previews a surface
 * that lives outside the app.
 */
const SERP_LINK = "text-[#1a0dab] dark:text-[#8ab4f8]";

/*
 * Not optional: blank is a real value here, meaning "fall back to the display
 * name" or "fall back to the bio".
 */
const seoFormSchema = z.object({
	seoTitle: z
		.string()
		.max(SEO_TITLE_MAX, `Title must be ${SEO_TITLE_MAX} characters or fewer`),
	seoDescription: z
		.string()
		.max(
			SEO_DESCRIPTION_MAX,
			`Description must be ${SEO_DESCRIPTION_MAX} characters or fewer`,
		),
});

type SeoFormValues = z.infer<typeof seoFormSchema>;

interface SeoSettingsProps {
	profile: ProfileData;
}

const TITLE_ID = "seo-title";
const DESCRIPTION_ID = "seo-description";

function CharacterCount({ value, max }: { value?: string; max: number }) {
	const length = value?.length ?? 0;
	const remaining = max - length;

	return (
		<span
			className={cn(
				"text-xs tabular-nums",
				// Colour, not a toast: the limit is a fact about the field, not a
				// failure worth interrupting for.
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
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: (updated) => {
				toast.success("Search settings updated");
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
			seoTitle: profile.seoTitle ?? "",
			seoDescription: profile.seoDescription ?? "",
		} satisfies SeoFormValues,
		validators: { onSubmit: seoFormSchema },
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
			<form.Field name="seoTitle">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;

					return (
						<Field data-invalid={isInvalid}>
							<div className="flex items-center justify-between gap-2">
								<FieldLabel htmlFor={TITLE_ID}>Meta title</FieldLabel>
								<CharacterCount value={field.state.value} max={SEO_TITLE_MAX} />
							</div>
							<Input
								id={TITLE_ID}
								name={field.name}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder={profile.displayName ?? "Your name"}
								aria-invalid={isInvalid}
								aria-describedby={`${TITLE_ID}-description`}
							/>
							<FieldDescription id={`${TITLE_ID}-description`}>
								The headline in search results. Leave blank to use your display
								name.
							</FieldDescription>
							{isInvalid && (
								<FieldError
									id={`${TITLE_ID}-error`}
									errors={field.state.meta.errors}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="seoDescription">
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;

					return (
						<Field data-invalid={isInvalid}>
							<div className="flex items-center justify-between gap-2">
								<FieldLabel htmlFor={DESCRIPTION_ID}>
									Meta description
								</FieldLabel>
								<CharacterCount
									value={field.state.value}
									max={SEO_DESCRIPTION_MAX}
								/>
							</div>
							<Textarea
								id={DESCRIPTION_ID}
								name={field.name}
								rows={3}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder={profile.bio ?? "A sentence about what you share."}
								aria-invalid={isInvalid}
								aria-describedby={`${DESCRIPTION_ID}-description`}
							/>
							<FieldDescription id={`${DESCRIPTION_ID}-description`}>
								The summary under the title. Leave blank to use your bio.
							</FieldDescription>
							{isInvalid && (
								<FieldError
									id={`${DESCRIPTION_ID}-error`}
									errors={field.state.meta.errors}
								/>
							)}
						</Field>
					);
				}}
			</form.Field>

			{/*
			 * Must stay in step with generateMetadata on the public profile route,
			 * or this previews a search result no visitor would ever get.
			 */}
			<form.Subscribe
				selector={(state) => ({
					seoTitle: state.values.seoTitle,
					seoDescription: state.values.seoDescription,
				})}
			>
				{({ seoTitle, seoDescription }) => {
					const resolvedTitle =
						seoTitle || profile.displayName || profile.username;

					return (
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
									{seoDescription ||
										"Nothing to show yet. Add a description to see it here."}
								</p>
							</div>
						</div>
					);
				}}
			</form.Subscribe>

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
