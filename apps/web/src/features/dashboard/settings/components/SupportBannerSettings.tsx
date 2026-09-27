"use client";

import { useMutation } from "@tanstack/react-query";
import { cn } from "cn";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
	isSupportCauseId,
	SUPPORT_CAUSE_IDS,
	SUPPORT_CAUSES,
	type SupportCause,
	type SupportCauseId,
} from "@/features/profile/components";
import type { ProfileData } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";

interface SupportBannerSettingsProps {
	profile: ProfileData;
}

const profileQueryKey = trpc.profile.getProfile.queryOptions().queryKey;

export function SupportBannerSettings({ profile }: SupportBannerSettingsProps) {
	const value = profile.supportBanner ?? "none";
	const isEnabled = isSupportCauseId(value);

	/*
	 * Seed from the last chosen cause, not the stored value: a banner that is
	 * * off stores "none", which is not a cause.
	 */
	const [lastCause, setLastCause] = useState<SupportCauseId>(
		isSupportCauseId(value) ? value : SUPPORT_CAUSE_IDS[0],
	);

	const switchId = useId();

	const highlighted = isEnabled ? value : lastCause;

	/*
	 * No success toast: the switch position and the highlighted cause are
	 * * already the feedback.
	 */
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			/*
			 * Optimistic, so the live preview updates before the response.
			 */
			onMutate: async (next) => {
				await queryClient.cancelQueries({ queryKey: profileQueryKey });
				const previous = queryClient.getQueryData(profileQueryKey);
				queryClient.setQueryData(profileQueryKey, (current) =>
					current && next.supportBanner
						? { ...current, supportBanner: next.supportBanner }
						: current,
				);
				return { previous };
			},
			onError: (error, _variables, context) => {
				toast.error(error.message);
				if (context?.previous) {
					queryClient.setQueryData(profileQueryKey, context.previous);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: profileQueryKey });
			},
		}),
	);

	const isPending = updateProfileMutation.isPending;

	function selectCause(next: SupportCause) {
		if (isSupportCauseId(next)) setLastCause(next);
		updateProfileMutation.mutate({ supportBanner: next });
	}

	function handleToggle(checked: boolean) {
		if (checked) {
			selectCause(lastCause);
		} else {
			if (isEnabled) setLastCause(value);
			selectCause("none");
		}
	}

	return (
		/*
		 * aria-busy, not disabled: disabling a focused control blurs it and
		 * * loses the keyboard user's place. Out-of-order writes are the cheaper
		 * * failure, since each sets one field and onSettled refetches.
		 */
		<div className="space-y-4" aria-busy={isPending}>
			<label
				htmlFor={switchId}
				className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-colors duration-150 ease-out hover:bg-muted/60 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
			>
				<span className="font-medium text-sm">Show the banner</span>
				<Switch
					id={switchId}
					checked={isEnabled}
					onCheckedChange={handleToggle}
				/>
			</label>

			{/*
			 * inert, because collapsing to 0fr clips the pixels but leaves the
			 * * radios in the tab order.
			 */}
			<div
				className={cn(
					"grid transition-[grid-template-rows,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
					isEnabled
						? "grid-rows-[1fr] opacity-100"
						: "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="overflow-hidden">
					<fieldset inert={!isEnabled} className="pt-2 pb-1">
						<legend className="sr-only">Choose a cause</legend>
						<div className="grid gap-2 sm:grid-cols-2">
							{SUPPORT_CAUSE_IDS.map((id) => {
								const cause = SUPPORT_CAUSES[id];
								const Icon = cause.icon;
								const isSelected = highlighted === id;

								return (
									<label
										key={id}
										className={cn(
											"flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-[background-color,border-color] duration-150 ease-out",
											"has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30",
											isSelected
												? "border-ring bg-accent"
												: "hover:bg-muted/60",
											isPending && "cursor-wait",
										)}
									>
										<input
											type="radio"
											name="support-banner-cause"
											value={id}
											checked={isSelected}
											onChange={() => selectCause(id)}
											className="sr-only"
										/>
										<span
											className={cn(
												"flex size-8 shrink-0 items-center justify-center rounded-full text-white",
												// Real banner colours, never tinted, so the near-black cause needs a * hairline to read on the dark card.
												"ring-1 ring-black/10 dark:ring-white/10",
												cause.color,
											)}
										>
											<Icon
												weight={isSelected ? "fill" : "regular"}
												className="size-4"
											/>
										</span>
										<span className="min-w-0">
											<span className="block font-medium text-sm">
												{cause.title}
											</span>
											<span className="mt-0.5 block text-muted-foreground text-xs leading-relaxed">
												{cause.description}
											</span>
										</span>
									</label>
								);
							})}
						</div>
					</fieldset>
				</div>
			</div>
		</div>
	);
}
