"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc/client";
import {
	type DateRangeOption,
	DateRangePicker,
} from "./components/DateRangePicker";
import { EngagementChart } from "./components/EngagementChart";
import { StatsOverview } from "./components/StatsOverview";
import { TopLinksList } from "./components/TopLinksList";

export default function AnalyticsPage() {
	const [range, setRange] = useState<DateRangeOption>("last7");
	const [date, setDate] = useState<DayPickerDateRange | undefined>(() => {
		const to = new Date();
		const from = new Date(to);
		from.setDate(from.getDate() - 7);
		return { from, to };
	});

	const {
		data: stats,
		isLoading,
		isError,
		refetch,
	} = useQuery(
		trpc.analytics.getStats.queryOptions({
			range: range !== "custom" ? (range as any) : undefined,
			from: range === "custom" ? date?.from : undefined,
			to: range === "custom" ? date?.to : undefined,
		}),
	);

	/*
	 * The header and the range picker used to unmount behind a full-page
	 * spinner, which collapsed the layout and made the control that drives the
	 * data disappear while it loaded. Only the data regions are placeheld now,
	 * so the page keeps its final geometry from the first frame.
	 */
	const isPending = isLoading || (!stats && !isError);

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
			<header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-title">Analytics</h1>
					<p className="mt-1 text-lead text-muted-foreground">
						Overview of your profile performance & engagement.
					</p>
				</div>
				<div className="w-full sm:w-auto">
					<DateRangePicker
						range={range}
						setRange={setRange}
						date={date}
						setDate={setDate}
					/>
				</div>
			</header>

			{isError ? (
				<div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
					<WarningCircle
						aria-hidden
						className="size-8 text-destructive opacity-60"
					/>
					<p className="font-medium text-body">Could not load analytics</p>
					<p className="max-w-72 text-caption text-muted-foreground">
						Check your connection, then try again. If it keeps failing, the
						numbers may still be settling.
					</p>
					<Button
						onClick={() => void refetch()}
						size="sm"
						variant="outline"
						className="mt-1"
					>
						Retry
					</Button>
				</div>
			) : (
				<>
					<StatsOverview
						loading={isPending}
						totalViews={stats?.totalViews ?? 0}
						totalClicks={stats?.totalClicks ?? 0}
						ctr={stats?.ctr ?? 0}
						viewsChange={stats?.viewsChange}
						clicksChange={stats?.clicksChange}
						ctrChange={stats?.ctrChange}
					/>

					<div className="grid gap-6 lg:grid-cols-7">
						<EngagementChart
							data={stats?.chartData ?? []}
							loading={isPending}
						/>
						<TopLinksList links={stats?.topLinks ?? []} loading={isPending} />
					</div>
				</>
			)}
		</div>
	);
}
