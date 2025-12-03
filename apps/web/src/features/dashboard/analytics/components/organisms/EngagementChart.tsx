"use client";

import { BarChart3, Circle } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ChartDataPoint {
	timestamp: string;
	views: number;
	clicks: number;
}

interface EngagementChartProps {
	data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		// Parse as UTC and convert to local time
		const timestamp = new Date(`${label} Z`); // Add 'Z' to ensure UTC parsing
		const now = new Date();
		const isToday = timestamp.toDateString() === now.toDateString();

		return (
			<div className="rounded-lg border border-border bg-background/95 p-3 text-sm shadow-xl backdrop-blur-sm">
				<p className="mb-2 border-border border-b pb-1 font-medium">
					{isToday ? (
						<>
							<span className="text-primary">Today</span>
							{" at "}
							{timestamp.toLocaleTimeString("en-US", {
								hour: "numeric",
								minute: "2-digit",
								hour12: true,
							})}
						</>
					) : (
						<>
							{timestamp.toLocaleDateString("en-US", {
								weekday: "short",
								month: "short",
								day: "numeric",
							})}
							{" at "}
							{timestamp.toLocaleTimeString("en-US", {
								hour: "numeric",
								minute: "2-digit",
								hour12: true,
							})}
						</>
					)}
				</p>
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-500" />
						<span className="text-muted-foreground">Views:</span>
						<span className="font-bold">{payload[0].value}</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-purple-500" />
						<span className="text-muted-foreground">Clicks:</span>
						<span className="font-bold">{payload[1].value}</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
};

export function EngagementChart({ data }: EngagementChartProps) {
	return (
		<Card className="shadow-sm lg:col-span-4">
			<CardHeader>
				<CardTitle>Engagement Overview</CardTitle>
				<CardDescription>Visualizing traffic trends over time.</CardDescription>
			</CardHeader>
			<CardContent className="pl-0">
				<div className="mb-4 flex items-center gap-4 pl-6">
					<div className="flex items-center gap-2">
						<Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
						<span className="text-muted-foreground text-sm">Views</span>
					</div>
					<div className="flex items-center gap-2">
						<Circle className="h-2 w-2 fill-purple-500 text-purple-500" />
						<span className="text-muted-foreground text-sm">Clicks</span>
					</div>
				</div>
				<div className="h-[350px] w-full">
					{data.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={data}
								margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									className="stroke-muted/30"
								/>
								<XAxis
									dataKey="timestamp"
									stroke="#888888"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									dy={10}
									tickFormatter={(str) => {
										// Parse as UTC and convert to local time
										const utcDate = new Date(`${str} Z`); // Add 'Z' to ensure UTC parsing
										const now = new Date();
										const isToday =
											utcDate.toDateString() === now.toDateString();

										if (isToday) {
											return utcDate.toLocaleTimeString("en-US", {
												hour: "numeric",
												hour12: true,
											});
										}
										return utcDate.toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										});
									}}
								/>
								<YAxis
									stroke="#888888"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `${value}`}
									width={40}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Line
									type="monotone"
									dataKey="views"
									name="Views"
									stroke="#3b82f6"
									strokeWidth={2}
									dot={{ fill: "#3b82f6", r: 3 }}
									activeDot={{ r: 5, fill: "#3b82f6" }}
									animationDuration={1000}
									animationEasing="ease-in-out"
								/>
								<Line
									type="monotone"
									dataKey="clicks"
									name="Clicks"
									stroke="#a855f7"
									strokeWidth={2}
									dot={{ fill: "#a855f7", r: 3 }}
									activeDot={{ r: 5, fill: "#a855f7" }}
									animationDuration={1000}
									animationEasing="ease-in-out"
								/>
							</LineChart>
						</ResponsiveContainer>
					) : (
						<div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
							<BarChart3 className="h-10 w-10 opacity-20" />
							<p>No data recorded for this period</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
