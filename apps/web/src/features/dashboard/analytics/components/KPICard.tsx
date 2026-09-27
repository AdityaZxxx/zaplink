"use client";

import { ArrowDown, ArrowUp, Minus } from "@phosphor-icons/react";
import { cn } from "cn";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface KPICardProps {
	title: string;
	value: string | number;
	subtitle: string;
	icon: React.ReactNode;
	change?: number;
	className?: string;
}

function Delta({ change }: { change: number }) {
	if (change === 0) {
		return (
			<span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
				<Minus aria-hidden className="size-3" weight="bold" />
				No change
			</span>
		);
	}

	const rising = change > 0;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-medium text-caption tabular-nums",
				rising ? "text-success" : "text-destructive",
			)}
		>
			{rising ? (
				<ArrowUp aria-hidden className="size-3" weight="bold" />
			) : (
				<ArrowDown aria-hidden className="size-3" weight="bold" />
			)}
			{rising ? "+" : "−"}
			{Math.abs(change).toFixed(1)}%
		</span>
	);
}

export function KPICard({
	title,
	value,
	subtitle,
	icon,
	change,
	className,
}: KPICardProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="font-medium text-body text-muted-foreground">
					{title}
				</CardTitle>
				<CardAction className="self-center">
					{/*
					 * Neutral on purpose, since the delta colours already mean rose and fell.
					 */}
					<span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-3.5">
						{icon}
					</span>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="font-semibold text-title tabular-nums">{value}</div>
				<div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption">
					{change !== undefined && <Delta change={change} />}
					<span className="text-muted-foreground">{subtitle}</span>
				</div>
			</CardContent>
		</Card>
	);
}
