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
	 * The last cause the visitor actually chose, so turning the banner off and
	 * back on restores their cause instead of silently swapping it for the first
	 * one in the list.
	 *
	 * Seeded with a real cause id rather than the stored value. A profile whose
	 * banner is off stores "none", which is not a cause, and initialising from it
	 * left the picker with nothing highlighted and made switching the banner back
	 * on a no-op that wrote "none" over "none".
	 */
	const [lastCause, setLastCause] = useState<SupportCauseId>(
		isSupportCauseId(value) ? value : SUPPORT_CAUSE_IDS[0],
	);

	// Stable across renders and unique if the section is ever mounted twice.
	const switchId = useId();

	// Which cause the picker marks as selected. While the banner is off the grid
	// is collapsed, so this only decides what a later re-enable restores.
	const highlighted = isEnabled ? value : lastCause;

	/*
	 * Deliberately no onSuccess toast. The switch position and the selected cause
	 * are already the feedback, and a toast on every tap is noise on a control
	 * people toggle repeatedly while they decide.
	 */
	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			/*
			 * The profile preview in this page reads the same cache entry, so the
			 * write happens before the response and the banner appears in the
			 * phone preview on the first frame rather than after a round trip.
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
			// Remember the cause being switched off so it can come back.
			if (isEnabled) setLastCause(value);
			selectCause("none");
		}
	}

	return (
		/*
		 * aria-busy, not disabled, while the save is in flight. Disabling a
		 * control that currently holds focus makes the browser blur it, so a
		 * keyboard visitor who pressed Space on the switch lost their place and
		 * had to tab back from the top after every toggle. Announcing the busy
		 * state keeps the control, and the focus, where they were.
		 *
		 * Two writes landing out of order is the cheaper failure: each one sets a
		 * single enum field, so the worst case is a briefly stale value that the
		 * onSettled refetch corrects.
		 */
		<div className="space-y-4" aria-busy={isPending}>
			{/*
			 * A <label> wrapping the switch, so the whole row is the hit target
			 * and the visible text is the accessible name. A bare switch beside a
			 * heading gave a 32x20px target and no name at all.
			 *
			 * The explicit htmlFor is not redundant with the wrapping. Base UI's
			 * switch renders a real checkbox input as its labelable control, so
			 * the implicit association already activates it, but naming the
			 * relationship attaches the accessible name to the control rather than
			 * only to the wrapper.
			 */}
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
			 * Reveal rather than a keyframe entrance. A toggle is a state change a
			 * visitor can interrupt, so it takes a transition that retargets
			 * mid-flight; animate-in/fade-in ran on a fixed timeline and could
			 * only be replayed, not reversed. grid-template-rows collapses the
			 * region without a measured height, and the exit is the same 150ms as
			 * the enter, which reads as a reveal rather than a performance.
			 *
			 * The transition alone does not hide the picker. Collapsing to 0fr
			 * clips the pixels, but the radios inside stay laid out and stay in
			 * the tab order, so a keyboard user tabbed through the panel landed on
			 * four invisible controls. `inert` on the fieldset is what actually
			 * takes them out of the tab order and the accessibility tree while
			 * they are collapsed.
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
						{/*
						 * Radios rather than buttons: the arrow keys move between
						 * causes for free, and the group reports itself correctly to
						 * assistive tech. Each one is picked by looking at it, since
						 * the card carries the same swatch and icon the visitor will
						 * actually see on their profile.
						 */}
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
												// The swatch has to show the banner's real colour, so
												// it cannot be tinted for legibility. Black Lives
												// Matter is near-black, which all but vanishes
												// against the dark card, so it gets the neutral
												// hairline that keeps a shape readable on any
												// background. Pure black in light, pure white in
												// dark, never a tinted neutral.
												"ring-1 ring-black/10 dark:ring-white/10",
												cause.color,
											)}
										>
											{/*
											 * Outline by default, fill when selected: the icon
											 * variant carries the selection, so the state does
											 * not depend on colour alone and survives motion
											 * being switched off.
											 */}
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
