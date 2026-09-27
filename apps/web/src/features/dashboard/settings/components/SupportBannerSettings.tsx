"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { queryClient, trpc } from "@/utils/trpc/client";

type SupportBanner =
	| "none"
	| "stop_genocide"
	| "black_lives_matter"
	| "climate_action"
	| "mental_health";

type SupportCause = Exclude<SupportBanner, "none">;

const SUPPORT_CAUSES: { value: SupportCause; label: string }[] = [
	{ value: "stop_genocide", label: "Stop Genocide" },
	{ value: "black_lives_matter", label: "Black Lives Matter" },
	{ value: "climate_action", label: "Climate Action" },
	{ value: "mental_health", label: "Mental Health Awareness" },
];

const isSupportCause = (value: string): value is SupportCause =>
	SUPPORT_CAUSES.some((cause) => cause.value === value);

export function SupportBannerSettings() {
	const { data: profile } = useQuery(trpc.profile.getProfile.queryOptions());
	const [optimisticValue, setOptimisticValue] = useState<string | null>(null);

	// Sync optimistic value with server data when it changes
	useEffect(() => {
		if (profile) {
			setOptimisticValue(profile.supportBanner);
		}
	}, [profile]);

	const isEnabled = optimisticValue && optimisticValue !== "none";

	const updateProfileMutation = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onMutate: async (newData) => {
				// Cancel any outgoing refetches
				await queryClient.cancelQueries({
					queryKey: trpc.profile.getProfile.queryOptions().queryKey,
				});

				// Snapshot the previous value
				const previousProfile = queryClient.getQueryData(
					trpc.profile.getProfile.queryOptions().queryKey,
				);

				// Optimistically update to the new value
				if (newData.supportBanner) {
					setOptimisticValue(newData.supportBanner);
				}

				return { previousProfile };
			},
			onSuccess: () => {
				toast.success("Support banner updated");
			},
			onError: (error, _variables, context) => {
				toast.error(error.message);
				// Rollback to the previous value
				if (context?.previousProfile) {
					queryClient.setQueryData(
						trpc.profile.getProfile.queryOptions().queryKey,
						context.previousProfile,
					);
					setOptimisticValue(
						(context.previousProfile as any).supportBanner || "none",
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries(trpc.profile.getProfile.queryOptions());
			},
		}),
	);

	const handleToggle = (checked: boolean) => {
		const newValue = checked ? "stop_genocide" : "none";
		setOptimisticValue(newValue);
		updateProfileMutation.mutate({
			supportBanner: newValue as any,
		});
	};

	const handleValueChange = (value: string | null) => {
		// The select only offers causes, so a null value means nothing is selected,
		// which for a support banner is the same as turning it off.
		const nextValue: SupportBanner =
			value !== null && isSupportCause(value) ? value : "none";
		setOptimisticValue(nextValue);
		updateProfileMutation.mutate({
			supportBanner: nextValue,
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h3 className="font-medium text-lg">Support Banner</h3>
					<p className="text-muted-foreground text-sm">
						Show your support for important causes on your profile.
					</p>
				</div>
				<Switch
					checked={!!isEnabled}
					onCheckedChange={handleToggle}
					disabled={updateProfileMutation.isPending}
				/>
			</div>

			<div className="space-y-4">
				{isEnabled && (
					<div className="fade-in slide-in-from-top-2 grid animate-in gap-2 pt-2 duration-300">
						<Label htmlFor="cause" className="font-medium text-sm">
							Select a Cause
						</Label>
						<Select
							value={optimisticValue || "none"}
							onValueChange={handleValueChange}
							disabled={updateProfileMutation.isPending}
						>
							<SelectTrigger className="w-full sm:w-[300px]">
								<SelectValue placeholder="Select a cause" />
							</SelectTrigger>
							<SelectContent>
								{SUPPORT_CAUSES.map((cause) => (
									<SelectItem key={cause.value} value={cause.value}>
										{cause.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>
		</div>
	);
}
