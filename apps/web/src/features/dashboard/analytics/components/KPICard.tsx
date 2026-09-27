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
}

/**
 * The delta used to be colour plus a 180-degree rotation of `TrendUp`, and
 * dropped the indicator entirely at exactly 0. Direction is now carried by a
 * real icon *and* a printed sign, so it survives greyscale and a screen
 * reader, and a flat value is a stated state rather than missing data.
 */
function Delta({ change }: { change: number }) {
	if (change === 0) {
		return (
			<span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
				<Minus aria-hidden className="size-3" weight="bold" />
				No change
			</span>
		);
	}

	const rising = change > 0;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-medium text-xs tabular-nums",
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
}: KPICardProps) {
	return (
		<Card>
			{/*
			 * CardHeader already switches to a two-column grid when a CardAction
			 * is present, so the icon is placed there instead of overriding the
			 * header with a hand-rolled flex row.
			 */}
			<CardHeader>
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<CardAction className="self-center">
					{/*
					 * Neutral on purpose. The tile used to carry a decorative
					 * blue/purple/green border, which collided with the green
					 * and red that already mean "rose" and "fell" further down.
					 * Colour on this card now means exactly one thing.
					 */}
					<span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-3.5">
						{icon}
					</span>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="font-semibold text-3xl tabular-nums tracking-tight">
					{value}
				</div>
				<div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
					{change !== undefined && <Delta change={change} />}
					<span className="text-muted-foreground">{subtitle}</span>
				</div>
			</CardContent>
		</Card>
	);
}
