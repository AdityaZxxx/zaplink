"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import { trpc } from "@/utils/trpc/client";
import {
	type DateRangeOption,
	DateRangePicker,
} from "./components/molecules/DateRangePicker";
import { EngagementChart } from "./components/organisms/EngagementChart";
import { StatsOverview } from "./components/organisms/StatsOverview";
import { TopLinksList } from "./components/organisms/TopLinksList";

export default function AnalyticsPage() {
	const [range, setRange] = useState<DateRangeOption>("last7");
	const [date, setDate] = useState<DayPickerDateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 7)),
		to: new Date(),
	});

	const { data: stats, isLoading } = useQuery(
		trpc.analytics.getStats.queryOptions({
			range: range !== "custom" ? (range as any) : undefined,
			from: range === "custom" ? date?.from : undefined,
			to: range === "custom" ? date?.to : undefined,
		}),
	);

	if (isLoading) {
		return (
			<div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="animate-pulse text-muted-foreground">
					Gathering insights...
				</p>
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="fade-in mx-auto max-w-7xl animate-in space-y-8 p-6 duration-500 md:p-8">
			{/* Header Section */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="font-bold text-3xl text-foreground tracking-tight">
						Analytics
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Overview of your profile performance & engagement.
					</p>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<DateRangePicker
						range={range}
						setRange={setRange}
						date={date}
						setDate={setDate}
					/>
				</div>
			</div>

			{/* KPI Cards Grid */}
			<StatsOverview
				totalViews={stats.totalViews}
				totalClicks={stats.totalClicks}
				ctr={stats.ctr}
				viewsChange={stats.viewsChange}
				clicksChange={stats.clicksChange}
				ctrChange={stats.ctrChange}
			/>

			{/* Main Chart Section */}
			<div className="grid gap-8 lg:grid-cols-7">
				<EngagementChart data={stats.chartData} />
				<TopLinksList links={stats.topLinks} />
			</div>
		</div>
	);
}
