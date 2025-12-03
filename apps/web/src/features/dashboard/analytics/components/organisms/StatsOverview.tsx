"use client";

import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { KPICard } from "../molecules/KPICard";

interface StatsOverviewProps {
	totalViews: number;
	totalClicks: number;
	ctr: number;
	viewsChange?: number;
	clicksChange?: number;
	ctrChange?: number;
}

// Helper function to format numbers with K/M/B suffixes
const formatNumber = (num: number) => {
	if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}  B`;
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}  M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}  K`;
	return num.toString();
};

export function StatsOverview({
	totalViews,
	totalClicks,
	ctr,
	viewsChange,
	clicksChange,
	ctrChange,
}: StatsOverviewProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<KPICard
				title="Total Views"
				value={formatNumber(totalViews)}
				subtitle="vs last period"
				icon={<Eye className="h-4 w-4" />}
				change={viewsChange}
				colorTheme="blue"
			/>
			<KPICard
				title="Total Clicks"
				value={formatNumber(totalClicks)}
				subtitle="vs last period"
				icon={<MousePointerClick className="h-4 w-4" />}
				change={clicksChange}
				colorTheme="purple"
			/>
			<KPICard
				title="CTR Rate"
				value={`${ctr.toFixed(1)}%`}
				subtitle="vs last period"
				icon={<TrendingUp className="h-4 w-4" />}
				change={ctrChange}
				colorTheme="green"
			/>
		</div>
	);
}
