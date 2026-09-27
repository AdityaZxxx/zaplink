"use client";

import { CursorClick, Eye, TrendUp } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "../lib/format";
import { KPICard } from "./KPICard";

interface StatsOverviewProps {
	totalViews: number;
	totalClicks: number;
	ctr: number;
	viewsChange?: number;
	clicksChange?: number;
	ctrChange?: number;
	loading?: boolean;
}

const TILES = [
	{ title: "Total views", icon: Eye },
	{ title: "Total clicks", icon: CursorClick },
	{ title: "Click-through rate", icon: TrendUp },
] as const;

export function StatsOverview({
	totalViews,
	totalClicks,
	ctr,
	viewsChange,
	clicksChange,
	ctrChange,
	loading = false,
}: StatsOverviewProps) {
	/*
	 * The skeleton reproduces the real tile's box -- same header row height,
	 * same figure and delta lines -- so the layout is already final when the
	 * numbers land and nothing reflows.
	 */
	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-3">
				{TILES.map(({ title }) => (
					<Card key={title}>
						<div className="flex h-7 items-center justify-between px-5">
							<Skeleton className="h-3.5 w-24" />
							<Skeleton className="rounded-lg" />
						</div>
						<div className="space-y-2 px-5">
							<Skeleton className="h-8 w-28" />
							<Skeleton className="h-3 w-32" />
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<KPICard
				title={TILES[0].title}
				value={formatCompact(totalViews)}
				subtitle="vs previous period"
				icon={<Eye />}
				change={viewsChange}
			/>
			<KPICard
				title={TILES[1].title}
				value={formatCompact(totalClicks)}
				subtitle="vs previous period"
				icon={<CursorClick />}
				change={clicksChange}
			/>
			<KPICard
				title={TILES[2].title}
				value={`${ctr.toFixed(1)}%`}
				subtitle="vs previous period"
				icon={<TrendUp />}
				change={ctrChange}
			/>
		</div>
	);
}
