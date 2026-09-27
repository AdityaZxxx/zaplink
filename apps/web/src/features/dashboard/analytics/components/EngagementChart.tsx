"use client";

import { ChartLineUp } from "@phosphor-icons/react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	formatBucketLong,
	formatBucketTick,
	formatCompact,
} from "../lib/format";

interface ChartDataPoint {
	timestamp: string;
	views: number;
	clicks: number;
}

interface EngagementChartProps {
	data: ChartDataPoint[];
	loading?: boolean;
}

/**
 * One array drives the legend, the plotted lines and the tooltip, so a series
 * cannot exist in one place and be missing from another.
 *
 * The colours are steps from the project's own `--chart-*` ramp rather than
 * raw hex. The ramp is a single hue ordered light to dark, so the darker end
 * goes to the strokes: a 2px line needs the contrast that a large fill does
 * not, and two steps of one hue stay legible where two arbitrary hues did not
 * adapt to dark mode at all.
 */
/**
 * The `--chart-*` ramp is theme-invariant, which is fine for large fills but
 * not for a 2px stroke: chart-5 reaches 8.85:1 on the light card and only
 * 2.03:1 on the dark one, and chart-1 is the reverse. So the two series are
 * declared as their own themed tokens in `index.css` rather than being read
 * off the shared ramp, which also means the theme switch is handled by CSS
 * instead of a re-render.
 */
const SERIES = [
	{ key: "views", label: "Views", color: "var(--color-chart-series-1)" },
	{ key: "clicks", label: "Clicks", color: "var(--color-chart-series-2)" },
] as const;

const AXIS_TICK = {
	fill: "var(--color-muted-foreground)",
	fontSize: 12,
} as const;

/*
 * Recharts 3 widened the label to `string | number | undefined`, so it has to
 * be narrowed before parsing. Without the guard a nullish label stringified
 * into "undefined Z" and every date in the tooltip read Invalid Date. The
 * function form of `content` is used rather than an element so the props are
 * typed instead of arriving as `any`.
 */
function CustomTooltip({ active, payload, label }: TooltipContentProps) {
	if (!active || !payload?.length || label == null) return null;

	const bucket = String(label);
	const rows = SERIES.flatMap((series) => {
		const point = payload.find((entry) => entry.dataKey === series.key);
		return point ? [{ ...series, value: Number(point.value) }] : [];
	});

	if (rows.length === 0) return null;

	return (
		<div className="min-w-40 rounded-xl bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10 dark:ring-foreground/15">
			<p className="mb-2 border-border border-b pb-1.5 font-medium text-caption">
				{formatBucketLong(bucket)}
			</p>
			<div className="space-y-1.5">
				{rows.map((row) => (
					<div key={row.key} className="flex items-center gap-2 text-caption">
						<span
							aria-hidden
							className="size-2 rounded-full"
							style={{ backgroundColor: row.color }}
						/>
						<span className="text-muted-foreground">{row.label}</span>
						<span className="ms-auto font-semibold tabular-nums">
							{formatCompact(row.value)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function ChartEmptyState() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
			<ChartLineUp aria-hidden className="size-8 opacity-30" />
			<p className="text-body">No activity recorded in this period</p>
			<p className="text-caption">
				Pick a wider date range, or share your profile to start collecting data.
			</p>
		</div>
	);
}

export function EngagementChart({
	data,
	loading = false,
}: EngagementChartProps) {
	const isEmpty = !loading && data.length === 0;

	return (
		<Card className="lg:col-span-4">
			<CardHeader>
				<CardTitle>Engagement</CardTitle>
				<CardDescription>Views and clicks over time.</CardDescription>
				{/*
				 * The legend lives in the header instead of a hand-aligned strip
				 * above the plot. That removes the `pl-0` on CardContent plus a
				 * manual `pl-6` on the legend, which existed only to re-derive
				 * the card's own padding and matched nothing.
				 */}
				{!isEmpty && (
					<CardAction className="flex items-center gap-4">
						{SERIES.map((series) => (
							<span
								key={series.key}
								className="flex items-center gap-1.5 text-caption text-muted-foreground"
							>
								<span
									aria-hidden
									className="size-2 rounded-full"
									style={{ backgroundColor: series.color }}
								/>
								{series.label}
							</span>
						))}
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				{loading ? (
					<Skeleton className="h-[350px] w-full" />
				) : isEmpty ? (
					<div className="h-[350px]">
						<ChartEmptyState />
					</div>
				) : (
					<div className="h-[350px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={data}
								margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
								accessibilityLayer
							>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									className="stroke-border"
								/>
								<XAxis
									dataKey="timestamp"
									tick={AXIS_TICK}
									tickLine={false}
									axisLine={false}
									dy={8}
									minTickGap={16}
									tickFormatter={formatBucketTick}
								/>
								<YAxis
									tick={AXIS_TICK}
									tickLine={false}
									axisLine={false}
									width={44}
									tickFormatter={(value: number) => formatCompact(value)}
								/>
								{SERIES.map((series) => (
									<Line
										key={series.key}
										type="monotone"
										dataKey={series.key}
										name={series.label}
										stroke={series.color}
										strokeWidth={2}
										/*
										 * No per-point dot. Thirty-plus daily points turned
										 * the line into a dotted rope and competed with the
										 * hovered value for attention; the active dot and the
										 * tooltip carry the read-out instead.
										 */
										dot={false}
										activeDot={{ r: 4, strokeWidth: 0 }}
										animationDuration={700}
										animationEasing="ease-out"
									/>
								))}
								{/*
								  Recharts 3 dropped the render-order hack that used to force
								  the Tooltip above the series, and now derives SVG z-order
								  from JSX order. Keep this last so the active dot cannot
								  paint over the tooltip.
								*/}
								<Tooltip content={CustomTooltip} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
