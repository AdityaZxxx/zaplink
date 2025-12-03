"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
	title: string;
	value: string | number;
	subtitle: string;
	icon: React.ReactNode;
	change?: number;
	colorTheme: "blue" | "purple" | "green";
}

export function KPICard({
	title,
	value,
	subtitle,
	icon,
	change,
	colorTheme,
}: KPICardProps) {
	const themeStyles = {
		blue: {
			border: "border-l-blue-500",
			iconBg: "bg-blue-500/10",
			iconColor: "text-blue-600",
		},
		purple: {
			border: "border-l-purple-500",
			iconBg: "bg-purple-500/10",
			iconColor: "text-purple-600",
		},
		green: {
			border: "border-l-green-500",
			iconBg: "bg-green-500/10",
			iconColor: "text-green-600",
		},
	};

	const theme = themeStyles[colorTheme];

	return (
		<Card
			className={cn(
				"border-l-4 shadow-sm transition-shadow hover:shadow-md",
				theme.border,
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<div className={cn("rounded-full p-2", theme.iconBg)}>
					{/* Clone icon to add className if needed, or just wrap it */}
					<div className={theme.iconColor}>{icon}</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="font-bold text-3xl">{value}</div>
				<div className="mt-1 flex items-center gap-1 text-xs">
					{change !== undefined && change !== 0 && (
						<>
							{change > 0 ? (
								<TrendingUp className="h-3 w-3 text-green-600" />
							) : (
								<TrendingUp className="h-3 w-3 rotate-180 text-red-600" />
							)}
							<span className={change > 0 ? "text-green-600" : "text-red-600"}>
								{Math.abs(change).toFixed(1)}%
							</span>
						</>
					)}
					<span className="text-muted-foreground">{subtitle}</span>
				</div>
			</CardContent>
		</Card>
	);
}
